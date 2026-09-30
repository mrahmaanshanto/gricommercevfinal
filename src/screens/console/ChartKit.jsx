'use client';
// Generated from design/templates/console/ChartKit.dc.html by scripts/convert-design.mjs.
// Chart and KPI kit
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

export default class ChartKitScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="ChartKit">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "4350px", overflow: "hidden", background: "#e9eef5" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "36px 80px 40px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Step 1 · Console foundation</p>
                <nav aria-label="Step 1 boards" style={{ display: "flex", gap: "8px" }}>
                  <__Link href="/core-ui-plan" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>← UI plan</__Link>
                  <__Link href="/console-shell" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Console shell</__Link>
                  <__Link href="/console-shell-dark" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Dark</__Link>
                  <__Link href="/chart-kit" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)", background: "rgba(127,212,245,.22)" }} aria-current="page">Chart and KPI kit</__Link>
                  <__Link href="/tenant-context-bar" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Tenant context bar</__Link>
                  <__Link href="/system-states" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>System states</__Link>
                </nav>
              </div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>Chart and KPI kit</h1>
              <p style={{ margin: "0", maxWidth: "820px", fontSize: "var(--text-base)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>Twelve chart components, one KPI tile, one chart card and five states. Every console and merchant core screen is assembled from these; nothing else draws data.</p>
            </div>
          </header>
          <section style={{ padding: "56px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>KPI tile</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>The number that opens every screen</h2>
            <div className="card" style={{ marginTop: "22px", padding: "36px 40px", display: "grid", gridTemplateColumns: "560px minmax(0,1fr)", gap: "56px" }}>
              <div style={{ paddingLeft: "14px" }}>
                <div style={{ position: "relative", width: "520px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px 20px 14px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Recurring revenue</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                    </div>
                    <div className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳88,000</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#047857" }}>▲ 1.8% vs last week</div>
                    <svg viewBox="0 0 200 36" width="100%" height="36" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                      <path d="M0.0,33.0 L8.7,30.4 L17.4,29.9 L26.1,27.6 L34.8,26.3 L43.5,27.6 L52.2,26.6 L60.9,21.7 L69.6,23.0 L78.3,21.9 L87.0,17.2 L95.7,18.4 L104.3,15.5 L113.0,15.9 L121.7,13.9 L130.4,14.9 L139.1,11.5 L147.8,9.2 L156.5,9.5 L165.2,7.3 L173.9,6.3 L182.6,7.8 L191.3,3.5 L200.0,3.0 L200,36 L0,36 Z" fill="rgba(0,48,135,.08)" />
                      <path d="M0.0,33.0 L8.7,30.4 L17.4,29.9 L26.1,27.6 L34.8,26.3 L43.5,27.6 L52.2,26.6 L60.9,21.7 L69.6,23.0 L78.3,21.9 L87.0,17.2 L95.7,18.4 L104.3,15.5 L113.0,15.9 L121.7,13.9 L130.4,14.9 L139.1,11.5 L147.8,9.2 L156.5,9.5 L165.2,7.3 L173.9,6.3 L182.6,7.8 L191.3,3.5 L200.0,3.0" fill="none" stroke="#003087" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 4px 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span>Source: billing ledger</span>
                    <span>Refreshed 14:30</span>
                  </div>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>1</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>2</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "92px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>3</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "124px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>4</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "176px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>5</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "496px", top: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>6</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>1</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Label</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>13 px, 500. Says what is counted, never a code name.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Value</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>30 px, 700, tabular figures; full value, no rounding above ৳1 crore.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>3</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Change</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>12.5 px, 600. Arrow plus words: direction, size and the comparison period.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>4</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Sparkline</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>36 px high, 2 px line, no axes; the last 24 points of the period.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>5</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Provenance</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Source and refresh time, under the tile or in its tooltip on dense rows.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>6</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Period</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Echoes the page's period control, so a tile never shows a different window.</div>
                  </div>
                </div>
                <div style={{ marginTop: "6px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a" }}>Colour of the change follows <strong>meaning, not direction</strong>. Revenue up is green; stores at risk up is the error colour.</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "20px", marginTop: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Default</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px 20px 14px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Stores at risk</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>5</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c2410c" }}>▲ 2 vs last week</div>
                  <svg viewBox="0 0 200 36" width="100%" height="36" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                    <path d="M0.0,32.1 L8.7,30.8 L17.4,19.5 L26.1,20.4 L34.8,16.1 L43.5,13.6 L52.2,15.2 L60.9,14.3 L69.6,21.0 L78.3,19.4 L87.0,25.1 L95.7,22.6 L104.3,24.8 L113.0,33.0 L121.7,32.5 L130.4,30.7 L139.1,21.5 L147.8,23.5 L156.5,18.2 L165.2,17.4 L173.9,11.7 L182.6,9.4 L191.3,7.0 L200.0,3.0 L200,36 L0,36 Z" fill="rgba(0,48,135,.08)" />
                    <path d="M0.0,32.1 L8.7,30.8 L17.4,19.5 L26.1,20.4 L34.8,16.1 L43.5,13.6 L52.2,15.2 L60.9,14.3 L69.6,21.0 L78.3,19.4 L87.0,25.1 L95.7,22.6 L104.3,24.8 L113.0,33.0 L121.7,32.5 L130.4,30.7 L139.1,21.5 L147.8,23.5 L156.5,18.2 L165.2,17.4 L173.9,11.7 L182.6,9.4 L191.3,7.0 L200.0,3.0" fill="none" stroke="#003087" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>With target</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px 20px 14px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Collections, September</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Month</span>
                  </div>
                  <div className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳88,000</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>On pace, 12 days left</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-sm)", background: "#eef2f7", overflow: "hidden" }}>
                      <div style={{ width: "73%", height: "100%", background: "#003087" }} />
                    </div>
                    <span className="num" style={{ fontSize: "var(--text-xs)", color: "#475569" }}>73% of ৳1,20,000</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Money at risk</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px 20px 14px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Value at risk</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Now</span>
                  </div>
                  <div className="num" style={{ fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳9,500</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c2410c" }}>▲ ৳2,500 since Monday</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", fontSize: "var(--text-xs)", color: "#c2410c", fontWeight: "var(--weight-medium)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>Value in dunning, 4 stores</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Compact, for rows and drawers</span>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                  <div style={{ flexGrow: "1" }}>
                    <div style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Orders this month</div>
                    <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>1,840 <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>/ 2,500</span></div>
                  </div>
                  <svg viewBox="0 0 200 36" width="96" height="28" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0.0,33.0 L8.7,30.4 L17.4,29.9 L26.1,27.6 L34.8,26.3 L43.5,27.6 L52.2,26.6 L60.9,21.7 L69.6,23.0 L78.3,21.9 L87.0,17.2 L95.7,18.4 L104.3,15.5 L113.0,15.9 L121.7,13.9 L130.4,14.9 L139.1,11.5 L147.8,9.2 L156.5,9.5 L165.2,7.3 L173.9,6.3 L182.6,7.8 L191.3,3.5 L200.0,3.0" fill="none" stroke="#003087" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>▲ 12%</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Loading</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 20px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", height: "168px" }} aria-busy="true" aria-label="Loading">
                  <div className="sk" style={{ width: "48%", height: "12px" }} />
                  <div className="sk" style={{ width: "62%", height: "30px" }} />
                  <div className="sk" style={{ width: "40%", height: "12px" }} />
                  <div className="sk" style={{ width: "100%", height: "36px", marginTop: "auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>No data yet</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px 20px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", height: "168px" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Cost to serve</span>
                  <div style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>—</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>No data yet. The first daily measure lands tomorrow at 03:00.</div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Chart card</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>One frame for every chart</h2>
            <div className="card" style={{ marginTop: "22px", padding: "36px 40px", display: "grid", gridTemplateColumns: "780px minmax(0,1fr)", gap: "48px" }}>
              <div style={{ paddingLeft: "14px" }}>
                <div style={{ position: "relative", width: "760px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px 4px" }}>
                    <h3 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Orders across all stores</h3>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f2f5f9", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Last 14 days</span>
                    <button type="button" aria-label="How this is counted" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "0", borderRadius: "var(--radius-lg)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </button>
                    <button className="btn ghost" type="button" style={{ marginLeft: "auto", minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
</svg>Export</button>
                  </div>
                  <div style={{ padding: "0 20px" }}>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>9,612</span>
                    <span style={{ marginLeft: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#047857" }}>▲ 8.4% vs previous 14 days</span>
                  </div>
                  <svg viewBox="0 0 700 262" width="720" height="270" role="img" aria-label="Daily orders, 6 to 19 September" style={{ display: "block", margin: "4px 10px 0" }}>
                    <line x1="40" x2="660" y1="230" y2="230" stroke="#eef2f7" />
                    <text x="32" y="234" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">0</text>
                    <line x1="40" x2="660" y1="180" y2="180" stroke="#eef2f7" />
                    <text x="32" y="184" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">250</text>
                    <line x1="40" x2="660" y1="130" y2="130" stroke="#eef2f7" />
                    <text x="32" y="134" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">500</text>
                    <line x1="40" x2="660" y1="80" y2="80" stroke="#eef2f7" />
                    <text x="32" y="84" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">750</text>
                    <line x1="40" x2="660" y1="30" y2="30" stroke="#eef2f7" />
                    <text x="32" y="34" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">1,000</text>
                    <line x1="40" x2="660" y1="80" y2="80" stroke="#94a3b8" strokeDasharray="5 4" />
                    <text x="660" y="72" fontSize="11" fill="#475569" textAnchor="end" fontFamily="Poppins">Target 750 a day</text>
                    <rect x="48" y="119.4" width="30" height="110.6" rx="4" fill="#003087" />
                    <rect x="92" y="119.0" width="30" height="111.0" rx="4" fill="#003087" />
                    <rect x="136" y="124.0" width="30" height="106.0" rx="4" fill="#003087" />
                    <rect x="180" y="94.2" width="30" height="135.8" rx="4" fill="#003087" />
                    <rect x="224" y="121.4" width="30" height="108.6" rx="4" fill="#003087" />
                    <rect x="268" y="100.0" width="30" height="130.0" rx="4" fill="#003087" />
                    <rect x="312" y="82.2" width="30" height="147.8" rx="4" fill="#003087" />
                    <rect x="356" y="108.0" width="30" height="122.0" rx="4" fill="#003087" />
                    <rect x="400" y="87.4" width="30" height="142.6" rx="4" fill="#003087" />
                    <rect x="444" y="67.6" width="30" height="162.4" rx="4" fill="#009cde" />
                    <rect x="488" y="98.6" width="30" height="131.4" rx="4" fill="#003087" />
                    <rect x="532" y="82.8" width="30" height="147.2" rx="4" fill="#003087" />
                    <rect x="576" y="67.6" width="30" height="162.4" rx="4" fill="#003087" />
                    <rect x="620" y="73.0" width="30" height="157.0" rx="4" fill="#003087" />
                    <text x="63" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">06</text>
                    <text x="107" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="151" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">08</text>
                    <text x="195" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="239" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">10</text>
                    <text x="283" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="327" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">12</text>
                    <text x="371" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="415" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">14</text>
                    <text x="459" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="503" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">16</text>
                    <text x="547" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                    <text x="591" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">18</text>
                    <text x="635" y="252" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins" />
                  </svg>
                  <div style={{ position: "absolute", left: "456px", top: "118px", width: "196px", padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#0f172a", color: "#fff", boxShadow: "0 12px 28px -12px rgba(0,0,0,.5)" }}>
                    <div style={{ fontSize: "var(--text-xs)", color: "#a9bddc" }}>Mon 15 Sep 2026</div>
                    <div className="num" style={{ marginTop: "2px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>812 orders</div>
                    <div style={{ marginTop: "2px", fontSize: "var(--text-xs)", color: "#86efac" }}>▲ 62 over target</div>
                    <div style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#cbd8ee" }}>Top store: Mohona Traders, 94</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "10px 20px 14px", borderTop: "1px solid #eef2f7", marginTop: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#003087" }} />Orders</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", borderTop: "2px dashed #94a3b8" }} />Target</span>
                    <span style={{ marginLeft: "auto" }}>Source: order events · refreshed 14:30</span>
                  </div>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>1</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "56px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>2</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "120px", top: "96px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>3</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "640px", top: "116px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>4</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "-12px", top: "338px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>5</span>
                  <span aria-hidden="true" style={{ position: "absolute", left: "700px", top: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", boxShadow: "0 0 0 3px #fff" }}>6</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>1</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Header</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Title as a plain question the chart answers, period chip, one info button with the counting rule.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Headline</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>The total for the period and its change, so the chart is readable without hovering.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>3</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Plot</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Gridlines #EEF2F7, axis text 11 px, bars radius 4, target as a dashed slate line.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>4</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Tooltip</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Dark card, 125 ms open, instant between points; date, value, versus target, one useful extra.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>5</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Footer</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Legend on the left, source and refresh time on the right; every chart states both.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>6</span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Actions</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Export only. Anything that changes data lives on the page, not inside a chart.</div>
                  </div>
                </div>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Widths on the 12-column grid</div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr)", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Full</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "3px" }}>
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr)", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Half</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "3px" }}>
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr)", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Third</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "3px" }}>
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px minmax(0,1fr)", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Quarter</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "3px" }}>
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#003087" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "3px", background: "#e2e8f0" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Components</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Twelve charts, named for the developer</h2>
            <p style={{ margin: "8px 0 0", maxWidth: "780px", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Each is one component with the same props: data, period, refreshedAt, state. The smallest size is the narrowest card it may sit in.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px", marginTop: "22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<kpi-tile>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="14" fontSize="12" fill="#475569" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Recurring revenue · September</text>
                  <text x="0" y="56" fontSize="36" fill="#0f172a" textAnchor="start" fontWeight="700" fontFamily="Poppins, system-ui, sans-serif">৳88,000</text>
                  <text x="0" y="80" fontSize="12" fill="#047857" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">▲ 6.2%</text>
                  <text x="52" y="80" fontSize="12" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">vs August · 44 paying stores</text>
                  <path d="M0.0,128.7 L15.7,133.1 L31.3,133.3 L47.0,137.0 L62.6,141.9 L78.3,142.0 L93.9,134.6 L109.6,128.9 L125.2,123.7 L140.9,126.4 L156.5,124.5 L172.2,126.4 L187.8,129.8 L203.5,134.2 L219.1,137.0 L234.8,129.5 L250.4,123.3 L266.1,117.6 L281.7,111.9 L297.4,115.0 L313.0,116.4 L328.7,113.2 L344.3,108.5 L360.0,102.0 L360,146 L0,146 Z" fill="#003087" opacity=".08" />
                  <path d="M0.0,128.7 L15.7,133.1 L31.3,133.3 L47.0,137.0 L62.6,141.9 L78.3,142.0 L93.9,134.6 L109.6,128.9 L125.2,123.7 L140.9,126.4 L156.5,124.5 L172.2,126.4 L187.8,129.8 L203.5,134.2 L219.1,137.0 L234.8,129.5 L250.4,123.3 L266.1,117.6 L281.7,111.9 L297.4,115.0 L313.0,116.4 L328.7,113.2 L344.3,108.5 L360.0,102.0" fill="none" stroke="#003087" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="360.0" cy="102.0" r="4" fill="#fff" stroke="#003087" strokeWidth="2" />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Quarter</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Revenue movement</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<revenue-waterfall>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <rect x="12" y="51.0" width="42" height="75.0" rx="4" fill="#003087" />
                  <text x="33" y="46.0" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">৳60k</text>
                  <text x="33" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Start</text>
                  <line x1="54" x2="70" y1="51.0" y2="51.0" stroke="#94a3b8" strokeDasharray="3 3" />
                  <rect x="70" y="33.5" width="42" height="17.5" rx="4" fill="#10b981" />
                  <text x="91" y="28.5" fontSize="10" fill="#047857" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">+14k</text>
                  <text x="91" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">New</text>
                  <line x1="112" x2="128" y1="33.5" y2="33.5" stroke="#94a3b8" strokeDasharray="3 3" />
                  <rect x="128" y="23.5" width="42" height="10.0" rx="4" fill="#10b981" />
                  <text x="149" y="18.5" fontSize="10" fill="#047857" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">+8k</text>
                  <text x="149" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Expand</text>
                  <line x1="170" x2="186" y1="23.5" y2="23.5" stroke="#94a3b8" strokeDasharray="3 3" />
                  <rect x="186" y="23.5" width="42" height="5.0" rx="4" fill="#ff9800" />
                  <text x="207" y="18.5" fontSize="10" fill="#b45309" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">−4k</text>
                  <text x="207" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Contract</text>
                  <line x1="228" x2="244" y1="28.5" y2="28.5" stroke="#94a3b8" strokeDasharray="3 3" />
                  <rect x="244" y="28.5" width="42" height="7.5" rx="4" fill="#ff5724" />
                  <text x="265" y="23.5" fontSize="10" fill="#c2410c" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">−6k</text>
                  <text x="265" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Churn</text>
                  <line x1="286" x2="302" y1="36.0" y2="36.0" stroke="#94a3b8" strokeDasharray="3 3" />
                  <rect x="302" y="36.0" width="42" height="90.0" rx="4" fill="#003087" />
                  <text x="323" y="31.0" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">৳72k</text>
                  <text x="323" y="144" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">End</text>
                  <line x1="0" x2="360" y1="126" y2="126" stroke="#cbd5e1" />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Health score</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<health-ring>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <circle cx="70" cy="74" r="52" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle cx="70" cy="74" r="52" fill="none" stroke="#ff9800" strokeWidth="12" strokeLinecap="round" strokeDasharray="176.4 326.7" transform="rotate(-90 70 74)" />
                  <text x="70" y="82" fontSize="32" fill="#0f172a" textAnchor="middle" fontWeight="700" fontFamily="Poppins, system-ui, sans-serif">54</text>
                  <text x="70" y="100" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">of 100</text>
                  <circle cx="164" cy="26" r="6" fill="#10b981" />
                  <text x="178" y="30" fontSize="12" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Healthy</text>
                  <text x="250" y="30" fontSize="11" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">75–100</text>
                  <path d="M164,43 L171,56 L157,56 Z" fill="#ff9800" />
                  <text x="178" y="54" fontSize="12" fill="#0f172a" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">Watch</text>
                  <text x="250" y="54" fontSize="11" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">50–74</text>
                  <rect x="159" y="69" width="10" height="10" fill="#ff5724" transform="rotate(45 164 74)" />
                  <text x="178" y="78" fontSize="12" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">At risk</text>
                  <text x="250" y="78" fontSize="11" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">0–49</text>
                  <circle cx="164" cy="98" r="5" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <text x="178" y="102" fontSize="12" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">No data</text>
                  <text x="250" y="102" fontSize="11" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">new store</text>
                  <rect x="156" y="37" width="200" height="24" rx="6" fill="none" stroke="#ff9800" strokeWidth="1.5" />
                  <text x="156" y="134" fontSize="11" fill="#c2410c" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">▼ 21 in 7 days · billing and courier</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Third</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Signal breakdown</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<signal-bars>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="17" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Activation</text>
                  <rect x="96" y="8" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="8" width="193.6" height="11" rx="5.5" fill="#003087" />
                  <text x="360" y="17" fontSize="11" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">88</text>
                  <text x="0" y="40" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Activity</text>
                  <rect x="96" y="31" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="31" width="136.4" height="11" rx="5.5" fill="#003087" />
                  <text x="360" y="40" fontSize="11" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">62</text>
                  <text x="0" y="63" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Billing</text>
                  <rect x="96" y="54" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="54" width="44.0" height="11" rx="5.5" fill="#ff5724" />
                  <text x="360" y="63" fontSize="11" fill="#c2410c" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">20</text>
                  <text x="0" y="86" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Integrations</text>
                  <rect x="96" y="77" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="77" width="77.0" height="11" rx="5.5" fill="#ff5724" />
                  <text x="360" y="86" fontSize="11" fill="#c2410c" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">35</text>
                  <text x="0" y="109" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Technical</text>
                  <rect x="96" y="100" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="100" width="178.2" height="11" rx="5.5" fill="#003087" />
                  <text x="360" y="109" fontSize="11" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">81</text>
                  <text x="0" y="132" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Support</text>
                  <rect x="96" y="123" width="220" height="11" rx="5.5" fill="#eef2f7" />
                  <rect x="96" y="123" width="154.0" height="11" rx="5.5" fill="#003087" />
                  <text x="360" y="132" fontSize="11" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">70</text>
                  <line x1="206" x2="206" y1="2" y2="146" stroke="#475569" strokeDasharray="2 3" />
                  <text x="210" y="148" fontSize="9" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">50 · watch line</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Third</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Funnel</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<funnel>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <rect x="0" y="4" width="272.0" height="28" rx="6" fill="#012169" />
                  <text x="12" y="22" fontSize="11" fill="#fff" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Signups · 96</text>
                  <rect x="0" y="40" width="201.2" height="28" rx="6" fill="#003087" />
                  <text x="12" y="58" fontSize="11" fill="#fff" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Trials started · 71</text>
                  <text x="360" y="58" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">74%</text>
                  <rect x="0" y="76" width="147.3" height="28" rx="6" fill="#2e559d" />
                  <text x="12" y="94" fontSize="11" fill="#fff" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Activated · 52</text>
                  <text x="360" y="94" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">73%</text>
                  <rect x="0" y="112" width="107.7" height="28" rx="6" fill="#0070a0" />
                  <text x="12" y="130" fontSize="11" fill="#fff" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Paid · 38</text>
                  <text x="360" y="130" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">73%</text>
                  <text x="360" y="22" fontSize="10" fill="#64748b" textAnchor="end" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">step rate</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Third</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Cohort retention</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<cohort-grid>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="61" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M0</text>
                  <text x="115" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M1</text>
                  <text x="169" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M2</text>
                  <text x="223" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M3</text>
                  <text x="277" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M4</text>
                  <text x="331" y="10" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">M5</text>
                  <text x="0" y="29" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Apr</text>
                  <rect x="36" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="29" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                  <rect x="90" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.65" />
                  <text x="115" y="29" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">84</text>
                  <rect x="144" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.51" />
                  <text x="169" y="29" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">76</text>
                  <rect x="198" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.42" />
                  <text x="223" y="29" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">71</text>
                  <rect x="252" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.36" />
                  <text x="277" y="29" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">68</text>
                  <rect x="306" y="16" width="50" height="19" rx="4" fill="#003087" opacity="0.32" />
                  <text x="331" y="29" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">66</text>
                  <text x="0" y="51" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">May</text>
                  <rect x="36" y="38" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="51" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                  <rect x="90" y="38" width="50" height="19" rx="4" fill="#003087" opacity="0.65" />
                  <text x="115" y="51" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">84</text>
                  <rect x="144" y="38" width="50" height="19" rx="4" fill="#003087" opacity="0.53" />
                  <text x="169" y="51" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">77</text>
                  <rect x="198" y="38" width="50" height="19" rx="4" fill="#003087" opacity="0.40" />
                  <text x="223" y="51" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">70</text>
                  <rect x="252" y="38" width="50" height="19" rx="4" fill="#003087" opacity="0.36" />
                  <text x="277" y="51" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">68</text>
                  <text x="0" y="73" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Jun</text>
                  <rect x="36" y="60" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="73" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                  <rect x="90" y="60" width="50" height="19" rx="4" fill="#003087" opacity="0.65" />
                  <text x="115" y="73" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">84</text>
                  <rect x="144" y="60" width="50" height="19" rx="4" fill="#003087" opacity="0.49" />
                  <text x="169" y="73" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">75</text>
                  <rect x="198" y="60" width="50" height="19" rx="4" fill="#003087" opacity="0.38" />
                  <text x="223" y="73" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">69</text>
                  <text x="0" y="95" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Jul</text>
                  <rect x="36" y="82" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="95" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                  <rect x="90" y="82" width="50" height="19" rx="4" fill="#003087" opacity="0.60" />
                  <text x="115" y="95" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">81</text>
                  <rect x="144" y="82" width="50" height="19" rx="4" fill="#003087" opacity="0.45" />
                  <text x="169" y="95" fontSize="9" fill="#0f172a" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">73</text>
                  <text x="0" y="117" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Aug</text>
                  <rect x="36" y="104" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="117" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                  <rect x="90" y="104" width="50" height="19" rx="4" fill="#003087" opacity="0.60" />
                  <text x="115" y="117" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">81</text>
                  <text x="0" y="139" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Sep</text>
                  <rect x="36" y="126" width="50" height="19" rx="4" fill="#003087" opacity="0.95" />
                  <text x="61" y="139" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">100</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Usage meter</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<usage-meter>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="16" fontSize="12" fill="#0f172a" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Orders this month</text>
                  <text x="360" y="16" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">1,840 / 2,500</text>
                  <rect x="0" y="24" width="360" height="10" rx="5" fill="#eef2f7" />
                  <rect x="0" y="24" width="265.0" height="10" rx="5" fill="#003087" />
                  <line x1="288" x2="288" y1="21" y2="37" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="0" y="64" fontSize="12" fill="#0f172a" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Products</text>
                  <text x="62.8" y="64" fontSize="11" fill="#b45309" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">· Near limit</text>
                  <text x="360" y="64" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">410 / 500</text>
                  <rect x="0" y="72" width="360" height="10" rx="5" fill="#eef2f7" />
                  <rect x="0" y="72" width="295.2" height="10" rx="5" fill="#ff9800" />
                  <line x1="288" x2="288" y1="69" y2="85" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="0" y="112" fontSize="12" fill="#0f172a" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Staff seats</text>
                  <text x="82.6" y="112" fontSize="11" fill="#c2410c" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">· At limit</text>
                  <text x="360" y="112" fontSize="12" fill="#0f172a" textAnchor="end" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">5 / 5</text>
                  <rect x="0" y="120" width="360" height="10" rx="5" fill="#eef2f7" />
                  <rect x="0" y="120" width="360.0" height="10" rx="5" fill="#ff5724" />
                  <line x1="288" x2="288" y1="117" y2="133" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="288" y="148" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">80% warning tick</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Third</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Cost to serve</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<cost-scatter>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <line x1="30" y1="126" x2="354" y2="126" stroke="#cbd5e1" />
                  <line x1="30" y1="10" x2="30" y2="126" stroke="#cbd5e1" />
                  <line x1="30" y1="126" x2="354" y2="34" stroke="#003087" strokeWidth="1.5" strokeDasharray="5 4" />
                  <text x="354" y="28" fontSize="10" fill="#003087" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">plan ceiling</text>
                  <circle cx="48" cy="118" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="62" cy="112" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="80" cy="116" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="95" cy="104" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="110" cy="108" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="128" cy="96" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="140" cy="101" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="160" cy="90" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="172" cy="94" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="190" cy="82" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="210" cy="86" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="228" cy="72" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="250" cy="76" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="276" cy="64" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="300" cy="58" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="322" cy="50" r="4.5" fill="#003087" opacity=".7" />
                  <circle cx="118" cy="72" r="9" fill="none" stroke="#ff5724" strokeWidth="1.5" />
                  <circle cx="118" cy="72" r="4.5" fill="#ff5724" />
                  <circle cx="206" cy="48" r="9" fill="none" stroke="#ff5724" strokeWidth="1.5" />
                  <circle cx="206" cy="48" r="4.5" fill="#ff5724" />
                  <circle cx="86" cy="88" r="9" fill="none" stroke="#ff5724" strokeWidth="1.5" />
                  <circle cx="86" cy="88" r="4.5" fill="#ff5724" />
                  <text x="36" y="16" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Cost to serve ↑</text>
                  <text x="354" y="144" fontSize="10" fill="#475569" textAnchor="end" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Revenue →</text>
                  <text x="36" y="144" fontSize="10" fill="#c2410c" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">3 stores above ceiling</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Uptime strip</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<uptime-strip>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="20" fontSize="22" fill="#0f172a" textAnchor="start" fontWeight="700" fontFamily="Poppins, system-ui, sans-serif">99.96%</text>
                  <text x="86" y="20" fontSize="11" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">uptime · last 90 days</text>
                  <rect x="0" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="4" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="8" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="12" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="16" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="20" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="24" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="28" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="32" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="36" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="40" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="44" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="48" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="52" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="56" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="60" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="64" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="68" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="72" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="76" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="80" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="84" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="88" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="92" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="96" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="100" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="104" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="108" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="112" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="116" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="120" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="124" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="128" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="132" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="136" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="140" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="144" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="148" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="152" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="156" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="160" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="164" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="168" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="172" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="176" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="180" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="184" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="188" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="192" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="196" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="200" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="204" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="208" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="212" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="216" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="220" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="224" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="228" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="232" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="236" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="240" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="244" y="36" width="3" height="46" rx="1" fill="#ff9800" />
                  <rect x="248" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="252" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="256" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="260" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="264" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="268" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="272" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="276" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="280" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="284" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="288" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="292" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="296" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="300" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="304" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="308" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="312" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="316" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="320" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="324" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="328" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="332" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="336" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="340" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="344" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="348" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="352" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <rect x="356" y="36" width="3" height="46" rx="1" fill="#10b981" />
                  <path d="M245,92 l4,-6 l4,6 z" fill="#b45309" />
                  <text x="258" y="100" fontSize="10" fill="#b45309" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">26 min degraded · 12 Aug</text>
                  <text x="0" y="100" fontSize="10" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">90 days ago</text>
                  <text x="360" y="118" fontSize="10" fill="#64748b" textAnchor="end" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Today</text>
                  <circle cx="6" cy="138" r="5" fill="#10b981" />
                  <text x="16" y="142" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Operational</text>
                  <path d="M96,132 L102,143 L90,143 Z" fill="#ff9800" />
                  <text x="106" y="142" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Degraded</text>
                  <rect x="168" y="134" width="8" height="8" fill="#ff5724" transform="rotate(45 172 138)" />
                  <text x="182" y="142" fontSize="10" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Down</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Integration matrix</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<status-matrix>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="18" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Pathao</text>
                  <circle cx="100" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="123" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="146" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="169" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="192" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="215" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="238" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="261" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="284" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="307" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="330" cy="14" r="5.5" fill="#10b981" />
                  <circle cx="353" cy="14" r="5.5" fill="#10b981" />
                  <text x="0" y="42" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Steadfast</text>
                  <circle cx="100" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="123" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="146" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="169" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="192" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="215" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="238" cy="38" r="5.5" fill="#10b981" />
                  <circle cx="261" cy="38" r="5.5" fill="#10b981" />
                  <rect x="279.5" y="33.5" width="9.0" height="9.0" fill="#ff5724" transform="rotate(45 284 38)" />
                  <rect x="302.5" y="33.5" width="9.0" height="9.0" fill="#ff5724" transform="rotate(45 307 38)" />
                  <rect x="325.5" y="33.5" width="9.0" height="9.0" fill="#ff5724" transform="rotate(45 330 38)" />
                  <rect x="348.5" y="33.5" width="9.0" height="9.0" fill="#ff5724" transform="rotate(45 353 38)" />
                  <text x="0" y="66" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">bKash</text>
                  <circle cx="100" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="123" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="146" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="169" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="192" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="215" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="238" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="261" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="284" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="307" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="330" cy="62" r="5.5" fill="#10b981" />
                  <circle cx="353" cy="62" r="5.5" fill="#10b981" />
                  <text x="0" y="90" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">SMS gateway</text>
                  <circle cx="100" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="123" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="146" cy="86" r="5.5" fill="#10b981" />
                  <path d="M169,79.5 L175.5,91.5 L162.5,91.5 Z" fill="#ff9800" />
                  <circle cx="192" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="215" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="238" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="261" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="284" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="307" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="330" cy="86" r="5.5" fill="#10b981" />
                  <circle cx="353" cy="86" r="5.5" fill="#10b981" />
                  <text x="0" y="114" fontSize="11" fill="#475569" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Meta CAPI</text>
                  <circle cx="100" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="123" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="146" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="169" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="192" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="215" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="238" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="261" cy="110" r="5.5" fill="#10b981" />
                  <circle cx="284" cy="110" r="5.5" fill="#10b981" />
                  <path d="M307,103.5 L313.5,115.5 L300.5,115.5 Z" fill="#ff9800" />
                  <path d="M330,103.5 L336.5,115.5 L323.5,115.5 Z" fill="#ff9800" />
                  <path d="M353,103.5 L359.5,115.5 L346.5,115.5 Z" fill="#ff9800" />
                  <text x="100" y="144" fontSize="10" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">12 hours ago</text>
                  <text x="353" y="144" fontSize="10" fill="#64748b" textAnchor="end" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">now</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Provisioning pipeline</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<pipeline>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <text x="0" y="16" fontSize="11" fill="#475569" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Rongdhonu Fashion · signed up 10:42</text>
                  <line x1="29" x2="68" y1="60" y2="60" stroke="#003087" strokeWidth="3" />
                  <line x1="94" x2="133" y1="60" y2="60" stroke="#003087" strokeWidth="3" />
                  <line x1="159" x2="198" y1="60" y2="60" stroke="#003087" strokeWidth="3" />
                  <line x1="224" x2="263" y1="60" y2="60" stroke="#003087" strokeWidth="3" />
                  <line x1="289" x2="328" y1="60" y2="60" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
                  <circle cx="16" cy="60" r="13" fill="#003087" />
                  <path d="M11,60 l3.5,3.5 l6.5,-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="16" y="96" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Store</text>
                  <text x="16" y="112" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">2s</text>
                  <circle cx="81" cy="60" r="13" fill="#003087" />
                  <path d="M76,60 l3.5,3.5 l6.5,-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="81" y="96" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Owner</text>
                  <text x="81" y="112" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">1s</text>
                  <circle cx="146" cy="60" r="13" fill="#003087" />
                  <path d="M141,60 l3.5,3.5 l6.5,-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="146" y="96" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Theme</text>
                  <text x="146" y="112" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">6s</text>
                  <circle cx="211" cy="60" r="13" fill="#003087" />
                  <path d="M206,60 l3.5,3.5 l6.5,-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="211" y="96" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Domain</text>
                  <text x="211" y="112" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">41s</text>
                  <circle cx="276" cy="60" r="12" fill="#fff" stroke="#009cde" strokeWidth="3" />
                  <circle cx="276" cy="60" r="4.5" fill="#009cde" />
                  <text x="276" y="96" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Billing</text>
                  <text x="276" y="112" fontSize="10" fill="#0070a0" textAnchor="middle" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">running</text>
                  <circle cx="341" cy="60" r="12" fill="#fff" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="341" y="96" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Wizard</text>
                  <text x="341" y="112" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">waiting</text>
                  <text x="0" y="144" fontSize="10" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">Total so far 50 s · target under 3 min</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Full</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px 18px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Activity calendar</span>
                  <span className="mono" style={{ color: "#0070a0" }}>{"<activity-calendar>"}</span>
                </div>
                <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                  <rect x="0" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.67" />
                  <rect x="0" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.72" />
                  <rect x="0" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.87" />
                  <rect x="0" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.67" />
                  <rect x="0" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.69" />
                  <rect x="0" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.73" />
                  <rect x="0" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.20" />
                  <rect x="16" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.69" />
                  <rect x="16" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.75" />
                  <rect x="16" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.82" />
                  <rect x="16" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.51" />
                  <rect x="16" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.60" />
                  <rect x="16" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.51" />
                  <rect x="16" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.48" />
                  <rect x="32" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.77" />
                  <rect x="32" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.49" />
                  <rect x="32" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.90" />
                  <rect x="32" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.89" />
                  <rect x="32" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.76" />
                  <rect x="32" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.74" />
                  <rect x="32" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.19" />
                  <rect x="48" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.48" />
                  <rect x="48" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.70" />
                  <rect x="48" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.50" />
                  <rect x="48" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.55" />
                  <rect x="48" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="48" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.48" />
                  <rect x="48" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.33" />
                  <rect x="64" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.66" />
                  <rect x="64" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.84" />
                  <rect x="64" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.70" />
                  <rect x="64" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.75" />
                  <rect x="64" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.69" />
                  <rect x="64" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.76" />
                  <rect x="64" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.32" />
                  <rect x="80" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.59" />
                  <rect x="80" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.91" />
                  <rect x="80" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.90" />
                  <rect x="80" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.84" />
                  <rect x="80" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.78" />
                  <rect x="80" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.61" />
                  <rect x="80" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.22" />
                  <rect x="96" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.60" />
                  <rect x="96" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.50" />
                  <rect x="96" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.80" />
                  <rect x="96" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.65" />
                  <rect x="96" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.84" />
                  <rect x="96" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.64" />
                  <rect x="96" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.54" />
                  <rect x="112" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.84" />
                  <rect x="112" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.47" />
                  <rect x="112" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.56" />
                  <rect x="112" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.87" />
                  <rect x="112" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.68" />
                  <rect x="112" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.90" />
                  <rect x="112" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.30" />
                  <rect x="128" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.50" />
                  <rect x="128" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.75" />
                  <rect x="128" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.81" />
                  <rect x="128" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.59" />
                  <rect x="128" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.51" />
                  <rect x="128" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.62" />
                  <rect x="128" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.54" />
                  <rect x="144" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.80" />
                  <rect x="144" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.52" />
                  <rect x="144" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="144" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.52" />
                  <rect x="144" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.50" />
                  <rect x="144" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.82" />
                  <rect x="144" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.20" />
                  <rect x="160" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.71" />
                  <rect x="160" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.67" />
                  <rect x="160" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.55" />
                  <rect x="160" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.79" />
                  <rect x="160" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.53" />
                  <rect x="160" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.75" />
                  <rect x="160" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.17" />
                  <rect x="176" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.65" />
                  <rect x="176" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.56" />
                  <rect x="176" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.59" />
                  <rect x="176" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.89" />
                  <rect x="176" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.82" />
                  <rect x="176" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.60" />
                  <rect x="176" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.51" />
                  <rect x="192" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.56" />
                  <rect x="192" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.64" />
                  <rect x="192" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.84" />
                  <rect x="192" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.75" />
                  <rect x="192" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.52" />
                  <rect x="192" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.90" />
                  <rect x="192" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.22" />
                  <rect x="208" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="208" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.81" />
                  <rect x="208" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.61" />
                  <rect x="208" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.60" />
                  <rect x="208" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.50" />
                  <rect x="208" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.51" />
                  <rect x="208" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.38" />
                  <rect x="224" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="224" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.73" />
                  <rect x="224" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.63" />
                  <rect x="224" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.67" />
                  <rect x="224" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.89" />
                  <rect x="224" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.68" />
                  <rect x="224" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.37" />
                  <rect x="240" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.85" />
                  <rect x="240" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.55" />
                  <rect x="240" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.54" />
                  <rect x="240" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.87" />
                  <rect x="240" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.83" />
                  <rect x="240" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="240" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.21" />
                  <rect x="256" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.79" />
                  <rect x="256" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.88" />
                  <rect x="256" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.56" />
                  <rect x="256" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.88" />
                  <rect x="256" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.86" />
                  <rect x="256" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.73" />
                  <rect x="256" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.31" />
                  <rect x="272" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.52" />
                  <rect x="272" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.49" />
                  <rect x="272" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.89" />
                  <rect x="272" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="272" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.78" />
                  <rect x="272" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.58" />
                  <rect x="272" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.48" />
                  <rect x="288" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.44" />
                  <rect x="288" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.31" />
                  <rect x="288" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.25" />
                  <rect x="288" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.49" />
                  <rect x="288" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.21" />
                  <rect x="288" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.28" />
                  <rect x="288" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.23" />
                  <rect x="304" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.46" />
                  <rect x="304" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.36" />
                  <rect x="304" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.21" />
                  <rect x="304" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.49" />
                  <rect x="304" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.18" />
                  <rect x="304" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="304" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="320" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.20" />
                  <rect x="320" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="320" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="320" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.17" />
                  <rect x="320" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.26" />
                  <rect x="320" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="320" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="336" y="4" width="13" height="13" rx="3" fill="#003087" opacity="0.31" />
                  <rect x="336" y="20" width="13" height="13" rx="3" fill="#003087" opacity="0.35" />
                  <rect x="336" y="36" width="13" height="13" rx="3" fill="#003087" opacity="0.21" />
                  <rect x="336" y="52" width="13" height="13" rx="3" fill="#003087" opacity="0.22" />
                  <rect x="336" y="68" width="13" height="13" rx="3" fill="#003087" opacity="0.18" />
                  <rect x="336" y="84" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <rect x="336" y="100" width="13" height="13" rx="3" fill="#003087" opacity="0.12" />
                  <text x="0" y="138" fontSize="10" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">22 weeks · daily logins and orders</text>
                  <path d="M287,124 h62" stroke="#c2410c" strokeWidth="1.5" />
                  <text x="349" y="138" fontSize="10" fill="#c2410c" textAnchor="end" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">fading tail</text>
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "#475569", paddingTop: "8px", borderTop: "1px solid #eef2f7" }}>
                  <span>Smallest size: <strong style={{ color: "#0f172a" }}>Half</strong></span>
                  <span>States: 5</span>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>States</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Five states every chart must draw</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "16px", marginTop: "22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "240px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Payments by method</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "6px 16px 16px", flexGrow: "1" }} aria-busy="true">
                    <div className="sk" style={{ width: "45%", height: "22px" }} />
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexGrow: "1" }}>
                      <div className="sk" style={{ flex: "1", height: "40%" }} />
                      <div className="sk" style={{ flex: "1", height: "62%" }} />
                      <div className="sk" style={{ flex: "1", height: "55%" }} />
                      <div className="sk" style={{ flex: "1", height: "78%" }} />
                      <div className="sk" style={{ flex: "1", height: "50%" }} />
                      <div className="sk" style={{ flex: "1", height: "70%" }} />
                      <div className="sk" style={{ flex: "1", height: "88%" }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Loading</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Skeleton in the final layout, shown only after 300 ms, kept for at least 500 ms.</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "240px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Payments by method</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0 20px 18px", textAlign: "center" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20M6 15h4" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>No payments in these 7 days</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Try 30 days, or check that a gateway is connected.</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Empty</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Says what is empty and the one thing that would fill it.</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "240px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Payments by method</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0 20px 18px", textAlign: "center" }}>
                    <span style={{ color: "#c2410c" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                        <path d="M12 9v4M12 17h.01" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>This chart could not load</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>The payments service timed out.</div>
                    <button className="btn ghost" type="button" style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5" />
</svg>Retry</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Error</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Names the failed source; retry in place, never a full-page error.</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "240px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Payments by method</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 16px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#fff4e0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#b45309" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>38 min old · source delayed</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexGrow: "1", padding: "12px 16px 16px" }}>
                    <div style={{ flex: "1", height: "40%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "62%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "55%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "78%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "50%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "70%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                    <div style={{ flex: "1", height: "88%", borderRadius: "var(--radius-sm)", background: "#99accf" }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Stale</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Old data is shown, greyed, with its age and why.</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "240px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Payments by method</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 days</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 16px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#f2f5f9", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 16v-4M12 8h.01" />
</svg>4 of 5 gateways reporting · Nagad missing</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexGrow: "1", padding: "12px 16px 16px" }}>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "34%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "50%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "45%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "64%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "40%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "58%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%" }}>
                      <div style={{ height: "72%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Partial</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>Draws what arrived and names what is missing.</div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 80px", display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "24px" }}>
            <div className="card" style={{ padding: "28px 32px" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Tokens</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Chart colours</h2>
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#003087", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.series.1</span>
                  <span className="mono" style={{ color: "#475569" }}>#003087</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Primary series, totals</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#009cde", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.series.2</span>
                  <span className="mono" style={{ color: "#475569" }}>#009cde</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Current, highlighted point (fill only)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#99d7f2", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.series.3</span>
                  <span className="mono" style={{ color: "#475569" }}>#99d7f2</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Secondary series</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#94a3b8", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.compare</span>
                  <span className="mono" style={{ color: "#475569" }}>#94a3b8</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Previous period, targets, dashed</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#eef2f7", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.grid</span>
                  <span className="mono" style={{ color: "#475569" }}>#eef2f7</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Gridlines, tracks</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#64748b", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.axis</span>
                  <span className="mono" style={{ color: "#475569" }}>#64748b</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Axis text, 11 px</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#10b981", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.good</span>
                  <span className="mono" style={{ color: "#475569" }}>#10b981</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Gains, healthy (text #047857)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#ff9800", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.watch</span>
                  <span className="mono" style={{ color: "#475569" }}>#ff9800</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Watch band (text #b45309)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#ff5724", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.risk</span>
                  <span className="mono" style={{ color: "#475569" }}>#ff5724</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>At risk, losses (text #C2410C)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 190px 90px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "44px", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#0f172a", border: "1px solid rgba(15,23,42,.08)" }} />
                  <span className="mono" style={{ color: "#0f172a" }}>chart.tooltip</span>
                  <span className="mono" style={{ color: "#475569" }}>#0f172a</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Tooltip surface, white text</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: "28px 32px" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Motion</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>How charts move</h2>
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "12px", minHeight: "44px", alignItems: "center", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Draw-in</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>First load only · 280 ms · ease-out (.23, 1, .32, 1) · 40 ms stagger between tiles</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "12px", minHeight: "44px", alignItems: "center", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Range change</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Retarget from current values · 200 ms · same curve</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "12px", minHeight: "44px", alignItems: "center", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Tooltip</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>125 ms fade · instant while moving between points</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "12px", minHeight: "44px", alignItems: "center", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Numbers</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Never count up; the new value simply replaces the old</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: "12px", minHeight: "44px", alignItems: "center", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Reduced motion</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Opacity only; no draw-in, no retargeting movement</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
