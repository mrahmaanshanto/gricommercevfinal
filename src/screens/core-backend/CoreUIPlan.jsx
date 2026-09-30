'use client';
// Generated from design/templates/core-backend/CoreUIPlan.dc.html by scripts/convert-design.mjs.
// Core backend UI · design plan
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
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.lift{transition:transform 220ms cubic-bezier(.23,1,.32,1),box-shadow 220ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){.lift:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(15,23,42,.05),0 16px 32px -14px rgba(15,23,42,.22)}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;transition:background-color 180ms ease,color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,.row:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
.row{display:grid;align-items:center;border-radius:var(--radius-xl);transition:background-color 180ms ease}
.row:hover{background:#f4f7fb}
@media (prefers-reduced-motion: reduce){.lift,.btn,.row{transition:none}.lift:hover{transform:none}.btn:active{transform:none}}
`;

// ---- markup ----

export default class CoreUIPlanScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CoreUIPlan">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div data-board="" style={{ width: "1440px", height: "6600px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "56px 80px 64px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-120px", top: "-160px", width: "520px", height: "520px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.18)" }} />
            <div style={{ position: "absolute", right: "-40px", top: "-80px", width: "360px", height: "360px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.14)" }} />
            <div style={{ position: "relative" }}>
              <nav aria-label="Plan boards" style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
                <__Link href="/core-plan" className="btn onnavy">← Build plan overview</__Link>
                <__Link href="/core-ui-data" className="btn onnavy">Data presentation system →</__Link>
              </nav>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Core backend UI · Design plan</p>
              <h1 style={{ margin: "14px 0 0", maxWidth: "960px", fontSize: "var(--text-5xl)", lineHeight: "1.06", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff", textWrap: "balance" }}>Forty-three screens to isolate, package, bill and watch every store.</h1>
              <p style={{ margin: "18px 0 0", maxWidth: "800px", fontSize: "var(--text-lg)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>The merchant modules are designed. This plan designs the core around them: the platform console GridCommerce staff run the service from, and the core screens a merchant sees when a store is created, a plan changes, a bill falls due or a domain is connected. Seven steps, each closed by a design review gate.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "1px", marginTop: "40px", maxWidth: "1080px", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "rgba(255,255,255,.12)" }}>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>43</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>screens across the core</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>7</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>steps, each closed by a gate</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>3</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>surfaces: console, admin, website</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>12</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>chart types, and no others</div>
                </div>
              </div>
            </div>
          </header>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Sequence</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Seven steps, in the order the data comes into being</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "760px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Each step designs screens whose data the step before created: a tenant before a plan, a plan before a bill, a bill before a health score. The console shell and chart kit come first because every later screen is assembled from them.</p>
            <div className="card" style={{ marginTop: "28px", padding: "24px 24px 20px" }}>
              <div style={{ display: "flex", gap: "6px", padding: "0 16px 14px" }}>
                <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ flexGrow: "1", height: "2px", background: "#cbd5e1" }} />
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Foundation</span>
                  <span style={{ flexGrow: "1", height: "2px", background: "#cbd5e1" }} />
                </div>
                <div style={{ flex: "3", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ flexGrow: "1", height: "2px", background: "#003087" }} />
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Build the core</span>
                  <span style={{ flexGrow: "1", height: "2px", background: "#003087" }} />
                </div>
                <div style={{ flex: "2", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ flexGrow: "1", height: "2px", background: "#009cde" }} />
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Watch</span>
                  <span style={{ flexGrow: "1", height: "2px", background: "#009cde" }} />
                </div>
                <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ flexGrow: "1", height: "2px", background: "#cbd5e1" }} />
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Ship</span>
                  <span style={{ flexGrow: "1", height: "2px", background: "#cbd5e1" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <a className="row" href="#step-1" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>01</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Console foundation</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Foundation</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 4" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "184px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">4</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>4 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>01 · 03</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-2" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>02</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Multi-tenancy</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Build the core</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 5" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "230px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">5</div>
                      <div title="Merchant admin: 1" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "46px", height: "28px", background: "#009cde", color: "#012169", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">1</div>
                      <div title="Website: 1" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "46px", height: "28px", background: "#99d7f2", color: "#0f172a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">1</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>7 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>02 · 04</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-3" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>03</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Packaging</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Build the core</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 5" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "230px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">5</div>
                      <div title="Merchant admin: 2" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "92px", height: "28px", background: "#009cde", color: "#012169", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">2</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>7 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>05 · 06</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-4" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>04</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Billing</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Build the core</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 5" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "230px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">5</div>
                      <div title="Merchant admin: 2" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "92px", height: "28px", background: "#009cde", color: "#012169", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">2</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>7 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>07</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-5" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>05</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Customer monitoring</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Watch</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 7" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "322px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">7</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>7 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>08</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-6" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>06</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Platform operations</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Watch</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Console: 7" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "322px", height: "28px", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">7</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>7 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>08</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
                <a className="row" href="#step-7" style={{ gridTemplateColumns: "64px 260px 140px 1fr 140px 40px", gap: "16px", padding: "12px 16px", color: "inherit" }}>
                  <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>07</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Package and hand off</span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Ship</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", gap: "2px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                      <div title="Handoff: 4" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "184px", height: "28px", background: "#94a3b8", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }} className="num">4</div>
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>4 screens</span>
                  </span>
                  {" "}
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>09</span></span>
                  {" "}
                  <span aria-hidden="true" style={{ fontSize: "var(--text-lg)", color: "#003087" }}>→</span>
                </a>
              </div>
              <div style={{ display: "flex", gap: "24px", alignItems: "center", padding: "18px 16px 4px", marginTop: "10px", borderTop: "1px solid #eef2f7" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Screens by surface</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#003087" }} />Console</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#009cde" }} />Merchant admin</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#99d7f2" }} />Website</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "#475569" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#94a3b8" }} />Handoff</span>
                <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "#475569" }}>Console 33 · Merchant admin 5 · Website 1 · Handoff 4</span>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Starting points</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Five existing boards feed this work</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "16px", marginTop: "24px" }}>
              <__Link href="/core-monitoring" className="card lift" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", color: "inherit" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Already on the canvas</span>
                <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>S5 · Merchant monitoring console</span>
                <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Reworked into the command centre in step 5; its health signals seed the health score.</span>
              </__Link>
              <__Link href="/core-packaging" className="card lift" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", color: "inherit" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Already on the canvas</span>
                <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Packaging, plans and billing</span>
                <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Source for the nine sets, the three ladders and the eight lifecycle states in steps 3 and 4.</span>
              </__Link>
              <__Link href="/core-architecture" className="card lift" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", color: "inherit" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Already on the canvas</span>
                <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Architecture</span>
                <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Table and field names for every widget in the step 7 handoff sheets.</span>
              </__Link>
              <__Link href="/set-usage" className="card lift" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", color: "inherit" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Already on the canvas</span>
                <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Settings · AI usage</span>
                <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Its spend-against-cap layout becomes the usage meter pattern for plan limits.</span>
              </__Link>
              <__Link href="/dev/site-map" className="card lift" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px", color: "inherit" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Already on the canvas</span>
                <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Site map</span>
                <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Gains a console section and links to every new screen in step 7.</span>
              </__Link>
            </div>
          </section>
          <section style={{ padding: "72px 80px 80px" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>The seven steps</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>What gets designed, step by step</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "760px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Screens are listed in the order they are designed inside each step. The key visual names the chart or pattern that carries the screen; all twelve charts are shown on the data presentation board.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "28px" }}>
              <article id="step-1" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>01</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Foundation</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Console foundation</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Every later screen sits inside this shell and draws its numbers with this kit. Deciding both once keeps forty-three screens consistent.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>4</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>01 · 03</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>Every chart renders from one token set, and every status still reads correctly in greyscale.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Console shell</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Staff sign-in identity, deep navy rail, environment badge, merchant search on Ctrl K, in light and dark.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Layout</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Chart and KPI kit</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>The twelve chart types as components, each with its loading, empty and error state.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>All twelve charts</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Tenant context bar</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Shows which store is open, its plan and state; becomes a logged impersonation banner once the merchant consents.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Status band</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>System states</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Empty, loading, no permission, store not found and stale-data notices, written once for every screen.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Skeletons</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-2" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>02</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Build the core</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Multi-tenancy</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>The tenant is the unit everything hangs on. Staff need to find any store, see its boundary and watch new stores come alive before plans or bills mean anything.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f2fafd", color: "#0070a0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Website</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>02 · 04</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>Any merchant found in two actions; a signup watched from form to live store without leaving the console.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Merchant directory</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every tenant with segment, plan, state, health and usage. Table and card views, saved filters.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Health score · usage meter</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Tenant profile</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Tenant ID, owner, segment, domains, storage, backups and data footprint for one store.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Usage meter</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Provisioning monitor</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Each signup moving through the job chain live; a failed stage shows its error and a retry.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Provisioning pipeline</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Domains and certificates</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every custom domain with DNS, propagation and certificate expiry, in plain language.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Integration matrix</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Backup and restore</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Per-tenant snapshots; restore one merchant with a dry run first, never touching another.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Uptime strip</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Your store is being created</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f2fafd", color: "#0070a0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Website</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>The signup progress screen: stages tick over in real time, then hand over to the setup wizard.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Provisioning pipeline</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Connect your domain</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Step-by-step DNS guide with plain-language status and help for .com.bd addresses.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Provisioning pipeline</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-3" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>03</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Build the core</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Packaging</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Plans are built from what a tenant can hold. The catalogue and entitlement grid decide what every merchant sees, so they are designed before anything is charged.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>05 · 06</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>Switching a module off in the console visibly changes the merchant's navigation and shows the locked screen.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Module catalogue</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>All 48 modules in nine sets, with the plans and segments that include each one.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Set matrix</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Plan builder</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Build a plan version from sets, limits and price, on the online, retail or wholesale ladder.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Set matrix</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Version compare</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Two plan versions side by side, and how many merchants stay grandfathered on each.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Merchant entitlements</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Per-store toggle grid: plan default, override, one-module trial with end date, reason code.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Set matrix</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Limits and meters</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Usage across all stores against each limit, and which merchants are near the ceiling.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Usage meter</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Plan and usage</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>What the merchant holds, meters against limits, and what the next rung adds.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Usage meter</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Locked feature and upgrade</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>A plain message, one-click upgrade or a trial of that one module, proration shown before confirming.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Plan ladder</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-4" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>04</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Build the core</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Billing</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Billing charges for the package. Its states (trial, grace, read-only, suspended) are also the strongest signals the monitoring screens read next.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>07</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>One merchant's month, from trial to charge to failed payment to recovery, walks screen to screen.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Subscription dashboard</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Recurring revenue, new, expansion, contraction, churn, collections and value at risk in dunning.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Revenue movement</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Lifecycle board</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Merchants in each state: trial, active, grace, past due, paused, suspended, cancelled, archived.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Invoices and credit notes</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every invoice and receipt; corrections issued as credit notes, never silent edits.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Table</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Payment verification</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Manual bKash and Nagad payments with transaction ID, screenshot and a duplicate flag.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Proof viewer</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Bill adjustment</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Add a line, discount or waiver with a reason code; second approval above the threshold.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Approval trail</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Billing panel</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Current plan, next charge, payment method and every invoice to download.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Payment failed states</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Merchant admin</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Banner, grace countdown, read-only mode and the one path back to full access.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Status band</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-5" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>05</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Watch</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Customer monitoring</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>GridCommerce's customers are its merchants. With tenant, plan and bill data in place, one health score can join them and tell staff who needs a call today.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>08</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>From any warning, staff reach the merchant, the reason and the next action in one click.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Command centre</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Reworks the existing monitoring board: KPIs, risk list, funnel and incidents on one screen.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Merchant 360</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>One store's health, activity, usage, bills, integrations, tickets and timeline together.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Health score · activity calendar</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Health score</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>How the score is built from six signals, and what moved it this week.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Signal breakdown</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Churn-risk queue</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Stores grouped by warning: no login, no orders, failed payment, failed integration, stalled setup; owner and next step.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Activity calendar</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Trial funnel and cohorts</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Signup to paid, where setup stalls, and month-by-month cohort retention.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Funnel · cohort retention</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Cost to serve</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Each store's database, storage, bandwidth and message use against its revenue.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Cost to serve</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Support console</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Look up by phone, store or invoice; health beside the ticket; diagnostics for non-technical staff.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Integration matrix</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-6" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>06</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Watch</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Platform operations</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Merchant health often starts as a platform fault. These screens trace a courier outage or a slow query to the stores it touches.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>08</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>An incident traces from alert to affected merchants to runbook without leaving the console.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Platform health</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Uptime, latency and error rate at a glance, with the open incident on top.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Uptime strip</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Endpoints and real users</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>p95 per endpoint and page speed from Bangladeshi devices and networks, against targets.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Signal breakdown</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Queues and jobs</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Depth, lag, failures and dead letters per queue, attributed to tenant and module.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>KPI tile</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Integration health</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Couriers, gateways, SMS, WhatsApp and Meta across every store, hour by hour.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Integration matrix</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Alerts and incidents</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Severity, named responder, affected merchants and the runbook to follow.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Status band</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Feature flags and notices</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Staged rollout by merchant group; broadcast notices and the public status page.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Usage meter</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Audit log</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Console</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every staff and merchant action, filterable, with impersonation sessions marked.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Table</span>
                    </span>
                  </div>
                </div>
              </article>
              <article id="step-7" className="card" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "40px", padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="num" style={{ fontSize: "var(--text-5xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>07</span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#0070a0" }}>Ship</span>
                  </div>
                  <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Package and hand off</h3>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>The work ships as one linked console, checked in dark mode and Bangla, with a spec the developer can build from without a single design question.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Handoff</span>
                  </div>
                  <div style={{ display: "flex", gap: "18px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span><span className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>4</span> screens</span>
                    <span>Builds on backend <span className="num" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>09</span></span>
                  </div>
                  <div style={{ marginTop: "4px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#f2f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Gate</div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#0f172a", textWrap: "pretty" }}>Every screen has its data fields, refresh rate, empty and error copy written down.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", alignContent: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Console site map</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Handoff</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every console screen linked, and a console section added to the existing site map.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Screen map</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Dark mode and Bangla pass</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Handoff</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Every new screen in dark mode, and with Bangla strings at twenty percent extra width.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>All screens</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Clickable prototype</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Handoff</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Console and merchant screens linked into the flows used in the pilot walkthrough.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Linked flows</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px 16px", border: "1px solid #e6ebf2", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "1.35", color: "#0f172a" }}>Developer handoff</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", whiteSpace: "nowrap" }}>Handoff</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569", textWrap: "pretty" }}>Per screen: data fields, endpoints, refresh interval, empty and error copy, chart specs.</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <rect x="1" y="6" width="2" height="5" rx="1" fill="#0070a0" />
                        <rect x="5" y="3" width="2" height="8" rx="1" fill="#0070a0" />
                        <rect x="9" y="1" width="2" height="10" rx="1" fill="#0070a0" />
                      </svg>
                      <span>Key visual:</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Spec sheets</span>
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
