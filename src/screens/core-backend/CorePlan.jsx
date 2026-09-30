'use client';
// Generated from design/templates/core-backend/CorePlan.dc.html by scripts/convert-design.mjs.
// Build plan · overview
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
.lift{transition:transform 220ms cubic-bezier(.23,1,.32,1),box-shadow 220ms cubic-bezier(.23,1,.32,1)}
.lift:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(15,23,42,.05),0 16px 32px -14px rgba(15,23,42,.22)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;transition:background-color 180ms ease,color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,.stepbtn:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.stepbtn{display:flex;width:100%;align-items:center;gap:14px;min-height:64px;padding:10px 14px;border:0;border-radius:var(--radius-xl);background:transparent;font:inherit;text-align:left;cursor:pointer;color:#334155;transition:background-color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.stepbtn:hover{background:#f1f5f9}
.stepbtn:active{transform:scale(.98)}
.stepbtn.on{background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.05),0 8px 20px -10px rgba(15,23,42,.25)}
@media (prefers-reduced-motion: reduce){.lift,.btn,.stepbtn{transition:none}.lift:hover{transform:none}.btn:active,.stepbtn:active{transform:none}}
`;

// ---- markup ----

export default class CorePlanScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CorePlan">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div data-board="" style={{ width: "1440px", height: "4500px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "64px 80px 64px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-120px", top: "-160px", width: "520px", height: "520px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.18)" }} />
            <div style={{ position: "absolute", right: "-40px", top: "-80px", width: "360px", height: "360px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.14)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Platform core · Build plan</p>
              <h1 style={{ margin: "14px 0 0", maxWidth: "900px", fontSize: "var(--text-5xl)", lineHeight: "1.06", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff", textWrap: "balance" }}>Forty-eight modules exist. This is the core that makes them one platform.</h1>
              <p style={{ margin: "18px 0 0", maxWidth: "760px", fontSize: "var(--text-lg)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>The merchant modules are designed and built. What remains is the layer underneath: tenant isolation, store provisioning, module packaging, subscription billing and merchant monitoring. Nine steps, each closed by a gate that must pass before the next begins.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "1px", marginTop: "40px", maxWidth: "1080px", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "rgba(255,255,255,.12)" }}>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>48</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>modules in the specification</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>9</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>build steps, each closed by a gate</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>4</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>phases, run in strict order</div>
                </div>
                <div style={{ padding: "20px 22px", background: "rgba(1,33,105,.92)" }}>
                  <div className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>1</div>
                  <div style={{ marginTop: "8px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>tenant key on every merchant record</div>
                </div>
              </div>
            </div>
          </header>
          <nav aria-label="Plan boards" style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "56px 80px 0" }}>
            <__Link href="/core-steps" className="btn ghost">Step explorer</__Link>
            <__Link href="/core-architecture" className="btn ghost">Architecture</__Link>
            <__Link href="/core-packaging" className="btn ghost">Packaging and billing</__Link>
            <__Link href="/core-monitoring" className="btn ghost">Merchant monitoring</__Link>
          </nav>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Where the core sits</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Five layers. The developer built layers four and five; this plan builds layer two.</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Modules keep their screens and logic. They gain a tenant key, an entitlement key, usage meters, audit events and health events, so the core can isolate, package, bill and watch them.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#eef2f7", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Built</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Retrofit</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>New in this plan</span>
            </div>
            <div style={{ display: "grid", gap: "10px", marginTop: "22px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: "28px", alignItems: "center", padding: "22px 26px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                <div>
                  <div className="mono" style={{ color: "var(--text-muted)" }}>LAYER 5</div>
                  <div style={{ marginTop: "4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Surfaces</div>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#eef2f7", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Built</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#475569" }}>Four addresses on gridcommerce.com.bd, all resolved to a tenant or to the console.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}><span className="mono" style={{ color: "var(--accent-text)" }}>gridcommerce.com.bd</span>Website and signup</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}><span className="mono" style={{ color: "var(--accent-text)" }}>app.</span>Admin and POS</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}><span className="mono" style={{ color: "var(--accent-text)" }}>storename. / own domain</span>Storefronts</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}><span className="mono" style={{ color: "var(--accent-text)" }}>console.</span>Platform console</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: "28px", alignItems: "center", padding: "22px 26px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                <div>
                  <div className="mono" style={{ color: "var(--text-muted)" }}>LAYER 4</div>
                  <div style={{ marginTop: "4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Merchant modules</div>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#eef2f7", color: "#475569", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Built</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#475569" }}>Built by the developer. Each gets a five-point retrofit in step 9.</p>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ flex: "none", width: "96px", paddingTop: "3px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Retail</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M04</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M03</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M16</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M18</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M28</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M07</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M15</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S1</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M17</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M01</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S2</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M22</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M20</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M21</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M24</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M19</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ flex: "none", width: "96px", paddingTop: "3px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Wholesale</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M13</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M14</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M05</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M27</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S8</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ flex: "none", width: "96px", paddingTop: "3px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Online</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M06</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M25</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M23</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M02</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M26</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M08</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M11</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M12</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M10</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G1</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G2</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G4</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G5</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S6</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ flex: "none", width: "96px", paddingTop: "3px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Communication</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S9</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S3</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G3</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G6</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S7</span>
                        <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M09</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: "28px", alignItems: "center", padding: "22px 26px", borderRadius: "var(--radius-xl)", background: "#f5fbfe", border: "1px solid rgba(0,156,222,.25)" }}>
                <div>
                  <div className="mono" style={{ color: "var(--text-muted)" }}>LAYER 3</div>
                  <div style={{ marginTop: "4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Shared engines</div>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Retrofit</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#475569" }}>Called by many modules, so they are retrofitted first.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>M07 · Products</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>M15 · Stock ledger</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>M17 · Payments</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>S1 · Customer record</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>M21 · Promotions</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>S3 · Notifications</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.08)", color: "#00567a", border: "1px solid rgba(0,156,222,.25)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>G1 · Event tracking</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: "28px", alignItems: "center", padding: "24px 26px", borderRadius: "var(--radius-xl)", background: "#012169", boxShadow: "0 18px 40px -20px rgba(1,33,105,.7)" }}>
                <div>
                  <div className="mono" style={{ color: "#7fd4f5" }}>LAYER 2</div>
                  <div style={{ marginTop: "4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#fff", letterSpacing: "0" }}>Platform core</div>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>New in this plan</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 14px", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#cbd8ee" }}>Every request, job, schedule and webhook passes through here before it touches a module. This is what the nine steps build.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "10px" }}>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="8" cy="15" r="4" />
                          <path d="m10.8 12.2 8.2-8.2M17 6l2 2M15 8l2 2" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Tenant resolver</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>F1</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Identity and audit</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>S4</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 9 4.5 4h15L21 9" />
                          <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                          <path d="M5 12v9h14v-9" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Provisioning</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>F1</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Entitlement</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>F3</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20M6 15h4" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Billing</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>F2</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(127,212,245,.25)", color: "#fff" }}>
                      <div style={{ color: "#7fd4f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 12h4l3-8 4 16 3-8h4" />
                        </svg>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "1.3" }}>Monitoring</div>
                      <div className="mono" style={{ marginTop: "4px", color: "#99b3d6" }}>S5</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: "28px", alignItems: "center", padding: "22px 26px", borderRadius: "var(--radius-xl)", background: "#f5fbfe", border: "1px solid rgba(0,156,222,.25)" }}>
                <div>
                  <div className="mono" style={{ color: "var(--text-muted)" }}>LAYER 1</div>
                  <div style={{ marginTop: "4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Data and infrastructure</div>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Retrofit</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#475569" }}>Scoped per tenant from step 2 onward.</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Database · tenant key on every row</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>File storage · prefix per tenant</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Cache · keys per tenant</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Search index · per tenant</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Queues · jobs carry tenant</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", border: "1px solid transparent", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Backups · restore per tenant</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "80px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Sequence</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Nine steps across four work lanes</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>The platform core lane sets the order. Other lanes run alongside it, never ahead of it. No step starts until the gate before it passes.</p>
            <div className="card" style={{ marginTop: "26px", padding: "28px 28px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", marginBottom: "12px" }}>
                <div />
                <div style={{ gridColumn: "2 / 5", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.08)", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em" }}><span className="num">Phase 1</span><span style={{ opacity: ".55" }}>·</span>Isolate</div>
                </div>
                <div style={{ gridColumn: "5 / 8", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.10)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em" }}><span className="num">Phase 2</span><span style={{ opacity: ".55" }}>·</span>{"Provision & package"}</div>
                </div>
                <div style={{ gridColumn: "8 / 10", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.10)", color: "#047857", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em" }}><span className="num">Phase 3</span><span style={{ opacity: ".55" }}>·</span>{"Charge & watch"}</div>
                </div>
                <div style={{ gridColumn: "10 / 11", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.12)", color: "#a45100", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em" }}><span className="num">Phase 4</span><span style={{ opacity: ".55" }}>·</span>Ship</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", gap: "0", alignItems: "end" }}>
                <div />
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>01</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Groundwork</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>02</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Tenant context</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>03</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{"Identity & audit"}</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#009cde" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>04</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Provisioning</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#009cde" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>05</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Entitlement</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#009cde" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>06</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Packaging</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#10b981" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>07</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Billing</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#10b981" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>08</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Monitoring</div>
                </div>
                <div style={{ padding: "0 4px 10px" }}>
                  <div style={{ height: "4px", borderRadius: "var(--radius-sm)", background: "#ff9800" }} />
                  <div className="num" style={{ marginTop: "10px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>09</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{"Wire & ship"}</div>
                </div>
              </div>
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", alignItems: "center", minHeight: "62px", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Platform core</div>
                  <div style={{ gridColumn: "2 / 3", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Tenancy model and registry</div>
                  </div>
                  <div style={{ gridColumn: "3 / 4", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Tenant resolver</div>
                  </div>
                  <div style={{ gridColumn: "4 / 5", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Identity and audit</div>
                  </div>
                  <div style={{ gridColumn: "5 / 6", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Provisioning</div>
                  </div>
                  <div style={{ gridColumn: "6 / 7", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Entitlement</div>
                  </div>
                  <div style={{ gridColumn: "7 / 8", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Plans</div>
                  </div>
                  <div style={{ gridColumn: "8 / 9", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-success)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #10b981" }}>Billing</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", alignItems: "center", minHeight: "62px", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Module retrofit</div>
                  <div style={{ gridColumn: "3 / 4", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Tenant key on all tables</div>
                  </div>
                  <div style={{ gridColumn: "6 / 8", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Entitlement keys and meters</div>
                  </div>
                  <div style={{ gridColumn: "10 / 11", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-warning)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #ff9800" }}>Waves 1 to 5</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", alignItems: "center", minHeight: "62px", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Console and monitoring</div>
                  <div style={{ gridColumn: "2 / 4", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Error tracking and uptime</div>
                  </div>
                  <div style={{ gridColumn: "4 / 6", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #003087" }}>Audit viewer and impersonation</div>
                  </div>
                  <div style={{ gridColumn: "9 / 10", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-success)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #10b981" }}>Merchant monitoring</div>
                  </div>
                  <div style={{ gridColumn: "10 / 11", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-warning)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #ff9800" }}>Runbooks</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", alignItems: "center", minHeight: "62px", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Admin and website</div>
                  <div style={{ gridColumn: "5 / 6", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Signup flow</div>
                  </div>
                  <div style={{ gridColumn: "6 / 8", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #009cde" }}>Locked screens and pricing page</div>
                  </div>
                  <div style={{ gridColumn: "8 / 9", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-success)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #10b981" }}>Billing panel</div>
                  </div>
                  <div style={{ gridColumn: "10 / 11", gridRow: "1", padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", minHeight: "40px", padding: "6px 12px", borderRadius: "var(--radius-lg)", background: "var(--fill-warning)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", lineHeight: "1.3", boxShadow: "0 6px 14px -8px #ff9800" }}>Pilot and go-live</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(9,minmax(0,1fr))", alignItems: "center", minHeight: "56px", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Gate</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #003087", color: "#003087", background: "#fff" }} title="Registry and table map signed off; no credential readable anywhere in the admin">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #003087", color: "#003087", background: "#fff" }} title="Isolation suite green: no path returns another merchant's orders, customers, products or files">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #003087", color: "#003087", background: "#fff" }} title="Every write in the merchant admin appears in the audit log with actor and tenant">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #009cde", color: "#00709f", background: "#fff" }} title="Signup to live store runs end to end unattended; one merchant restored without touching any other">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #009cde", color: "#00709f", background: "#fff" }} title="Switching a module off hides it, blocks its routes and jobs, and keeps its data for reactivation">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #009cde", color: "#00709f", background: "#fff" }} title="Pricing page, signup and the entitlement engine all read one catalogue">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #10b981", color: "#047857", background: "#fff" }} title="A full monthly cycle, including a failed payment and recovery, runs untouched on test merchants">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #10b981", color: "#047857", background: "#fff" }} title="Every merchant visible with live health; a test alert reaches its named responder">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "var(--radius-full)", border: "2px solid #ff9800", color: "#a45100", background: "#fff" }} title="Pilot merchants trading and billed on the platform; 99.9 percent uptime instrumented">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "80px 80px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>The nine steps</p>
                <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>What gets built, in order</h2>
              </div>
              <__Link href="/core-steps" className="btn solid">Open the step explorer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14M13 6l6 6-6 6" />
</svg></__Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "20px", marginTop: "26px" }}>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>01</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.08)", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Isolate</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Groundwork and the tenancy model</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Decide how merchants are separated, map every table, and lock down secrets before a line of tenant code is written.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Tenancy model document: isolation, cost, backup granularity and the path to move a large merchant onto its own database later</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Module registry: a stable key for every module (M01 to M28, S1 to S9, G1 to G6, F1 to F3, B1, B2) and the tables each one owns</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Table inventory sorted into merchant-owned, platform-owned and shared reference data</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Payment and courier credentials moved to encrypted, write-only storage; nothing rendered in readable form</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 1 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,48,135,.22)" }}>
                    <span style={{ flex: "none", color: "#003087", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Registry and table map signed off; no credential readable anywhere in the admin</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>02</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.08)", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Isolate</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Tenant context on every request</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>One tenant key on every merchant-owned record, and one resolver that sets it for web, API, jobs, schedules and webhooks.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Tenants table and a tenant resolver: host to tenant for storefronts and custom domains, token to tenant for the API</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Tenant key added to every merchant-owned table across all existing modules, back-filled and indexed first in composite keys</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Automatic query scoping on every tenant model; every write stamped with the tenant</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Queued jobs carry their tenant, scheduled tasks run per tenant, webhook receivers resolve the tenant from the route, console commands require one</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,48,135,.22)" }}>
                    <span style={{ flex: "none", color: "#003087", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Isolation suite green: no path returns another merchant's orders, customers, products or files</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>03</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.08)", color: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Isolate</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Identity, roles and audit</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Two sign-in worlds, tenant-scoped roles, and one audit trail that later feeds support and monitoring.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Separate sign-in for merchant users and for GridCommerce staff on the console</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Roles and permissions scoped to the tenant; ready-made roles seeded for every new store</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>One append-only audit log: actor, tenant, action, record, before and after, device and time</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <span>Two-factor sign-in for owners and console staff, session timeout, forced logout and login alerts</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,48,135,.22)" }}>
                    <span style={{ flex: "none", color: "#003087", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Every write in the merchant admin appears in the audit log with actor and tenant</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--accent-text)" }}>04</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.10)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Provision & package"}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Store provisioning and domains</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Signup on gridcommerce.com.bd produces a live, isolated store within minutes, with no human touch.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Provisioning as a retry-safe job chain: tenant, owner, default settings, default theme, storage, search index, free subdomain, billing account, segment and entitlements, hand-off to the setup wizard</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Free address at provisioning: storename.gridcommerce.com.bd</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Custom domains with a step-by-step DNS guide and .com.bd support</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Automatic certificate issue and renewal, forced HTTPS, www to non-www redirect</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,156,222,.28)" }}>
                    <span style={{ flex: "none", color: "#00709f", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#00709f" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Signup to live store runs end to end unattended; one merchant restored without touching any other</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--accent-text)" }}>05</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.10)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Provision & package"}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Module switches and the entitlement engine</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>One service decides what each merchant can see and use. No code ever reads a plan name.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>The module registry becomes the feature catalogue, grouped into a core set and shared sets</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>One entitlement service answers two questions: is this feature on, and how much of this limit is left</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Checked at the route, the API, the navigation and inside background jobs; the menu shows only held modules</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Limits metered and shown to the merchant: orders per month, products, staff seats, storage, courier connections, landing pages</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 3 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,156,222,.28)" }}>
                    <span style={{ flex: "none", color: "#00709f", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#00709f" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Switching a module off hides it, blocks its routes and jobs, and keeps its data for reactivation</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--accent-text)" }}>06</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.10)", color: "#00709f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Provision & package"}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Plans, segments and packages</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Package the modules into three ladders, one per segment, from one versioned catalogue.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Segments set at onboarding: online, retail, wholesale or any combination; the segment drives navigation, dashboard, reports and the ladder offered</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Versioned plan builder: a plan is a set of modules, limits and a price</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Grandfathering: every merchant pinned to the plan version they bought</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <span>Custom per-account plans with an approval threshold and a mandatory review date</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(0,156,222,.28)" }}>
                    <span style={{ flex: "none", color: "#00709f", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#00709f" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Pricing page, signup and the entitlement engine all read one catalogue</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--text-success)" }}>07</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.10)", color: "#047857", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Charge & watch"}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Subscription billing and invoicing</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Collect from every merchant every month, automatically, and never delete a store for a missed payment.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Subscription states: trial, active, grace, past due, paused, suspended, cancelled, archived, each with its access and data rule</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>15-day trial; the clock starts when the store is published or takes a first real order; one live trial per business</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Recurring charge through bKash, Nagad and card on the same gateways as payments, with a manual path: transaction ID, screenshot, duplicate ID detection</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Dunning by SMS, email and in-app: retry, grace, read-only, suspension</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(16,185,129,.28)" }}>
                    <span style={{ flex: "none", color: "#047857", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#047857" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>A full monthly cycle, including a failed payment and recovery, runs untouched on test merchants</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--text-success)" }}>08</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.10)", color: "#047857", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Charge & watch"}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Merchant monitoring and the platform console</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>The control room on console.gridcommerce.com.bd: every merchant's health, usage, money and integrations in one place.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Merchant directory with plan, status, usage, activation score and health, searchable and filterable</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Churn warnings: no login, no orders, failed payment, failed integration, stalled activation</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Per-merchant resource use and cost to serve beside revenue, with an alert above the plan ceiling</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />
                    <span>Subscription dashboard: recurring revenue, new, expansion, contraction, churn, collections, value at risk; trial funnel with stall points</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 3 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(16,185,129,.28)" }}>
                    <span style={{ flex: "none", color: "#047857", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#047857" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Every merchant visible with live health; a test alert reaches its named responder</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card lift" style={{ display: "flex", flexDirection: "column", padding: "24px", minHeight: "430px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="num" style={{ fontSize: "var(--text-4xl)", lineHeight: "1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--text-warning)" }}>09</span>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.12)", color: "#a45100", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Ship</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: "var(--text-lg)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Wire every module and ship the package</h3>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--text-muted)" }}>Bring each developer-built module onto the core in dependency order, then release behind staged flags.</p>
                <ul style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "8px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#ff9800" }} />
                    <span>Five-point check on every module: tenant scope proven, entitlement key, usage meters, audit events, health events</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#ff9800" }} />
                    <span>Shared engines first: products, stock ledger, payments, customer record, promotions, notifications, event tracking</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#ff9800" }} />
                    <span>Then each remaining module wave by wave; every module connects only to modules completed before it</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "#475569" }}>
                    <span style={{ flex: "none", marginTop: "7px", width: "5px", height: "5px", borderRadius: "var(--radius-lg)", background: "#ff9800" }} />
                    <span>Load tests against targets: storefront under 2.5 s on mid-range Android over 4G, API p95 300 ms read and 800 ms write, admin under 2 s</span>
                  </li>
                  <li style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", paddingLeft: "15px" }}>and 2 more in the step explorer</li>
                </ul>
                <div style={{ marginTop: "auto", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px dashed rgba(255,152,0,.32)" }}>
                    <span style={{ flex: "none", color: "#a45100", marginTop: "1px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#a45100" }}>Gate</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#334155" }}>Pilot merchants trading and billed on the platform; 99.9 percent uptime instrumented</div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
          <footer style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", background: "#012169", color: "#cbd8ee", fontSize: "var(--text-xs-plus)" }}>
            <span style={{ fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#fff" }}>GridCommerce · Platform core</span>
            <span>Build specification V2.6 · Core backend plan</span>
          </footer>
        </div>
      </div>
    );
  }
}
