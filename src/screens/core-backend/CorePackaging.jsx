'use client';
// Generated from design/templates/core-backend/CorePackaging.dc.html by scripts/convert-design.mjs.
// Packaging, plans and billing
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

export default class CorePackagingScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CorePackaging">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div data-board="" style={{ width: "1440px", height: "3900px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "64px 80px 64px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-120px", top: "-160px", width: "520px", height: "520px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.18)" }} />
            <div style={{ position: "absolute", right: "-40px", top: "-80px", width: "360px", height: "360px", borderRadius: "var(--radius-full)", border: "1px solid rgba(127,212,245,.14)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Platform core · Packaging and billing</p>
              <h1 style={{ margin: "14px 0 0", maxWidth: "900px", fontSize: "var(--text-5xl)", lineHeight: "1.06", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff", textWrap: "balance" }}>Package the modules. Bill for what each merchant holds.</h1>
              <p style={{ margin: "18px 0 0", maxWidth: "760px", fontSize: "var(--text-lg)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>Three ladders, one per segment, all read from one versioned catalogue. The entitlement engine enforces it, the billing engine collects for it, and neither ever reads a plan name directly.</p>
            </div>
          </header>
          <nav aria-label="Plan boards" style={{ display: "flex", gap: "10px", padding: "32px 80px 0" }}>
            <__Link href="/core-plan" className="btn ghost">← Build plan overview</__Link>
            <__Link href="/core-monitoring" className="btn ghost">Merchant monitoring</__Link>
          </nav>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Segments and ladders</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>A merchant picks a segment; the segment picks the ladder</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Segments can combine. Each segment carries its own ladder of the same three rungs, so a retail merchant never sees online-only modules in their plan, and an entry-plan merchant never sees warehouses or payroll.</p>
            <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: "28px", alignItems: "center", marginTop: "26px" }}>
              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <span style={{ display: "inline-flex", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", alignItems: "center", justifyContent: "center", background: "rgba(0,48,135,.08)", color: "#003087" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Online</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Storefront, checkout, courier and COD</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <span style={{ display: "inline-flex", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", alignItems: "center", justifyContent: "center", background: "rgba(0,48,135,.08)", color: "#003087" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9 4.5 4h15L21 9" />
                      <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                      <path d="M5 12v9h14v-9" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Retail</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Counter, POS, cash and barcode</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <span style={{ display: "inline-flex", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", alignItems: "center", justifyContent: "center", background: "rgba(0,48,135,.08)", color: "#003087" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
                      <path d="m3 8 9 5 9-5M12 13v8" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Wholesale</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Price lists, credit terms and dues</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
                <div className="card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Growth</div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span className="num" style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳1,000</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>per month</span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "var(--text-muted)" }}>Start selling in one segment with the everyday core.</p>
                </div>
                <div style={{ position: "relative", padding: "28px", borderRadius: "var(--radius-xl)", background: "#012169", color: "#fff", boxShadow: "0 24px 48px -24px rgba(1,33,105,.75)" }}>
                  <span style={{ position: "absolute", top: "18px", right: "18px", display: "inline-flex", height: "24px", alignItems: "center", padding: "0 8px", borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Middle rung</span>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#7fd4f5" }}>Business</div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span className="num" style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>৳2,500</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "#a9bddc" }}>per month</span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "#cbd8ee" }}>Adds offers, loyalty, cart recovery and the analytics hub.</p>
                </div>
                <div className="card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087" }}>Enterprise</div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span className="num" style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳5,000</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>per month</span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "1.55", color: "var(--text-muted)" }}>Adds warehouses, payroll and custom plans with review dates.</p>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Module packaging · draft for the plan builder</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Nine sets hold every merchant-facing module, each exactly once</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Sets, not single modules, are what the plan builder attaches to a plan version. The website and the console run on the GridCommerce side and sit outside every plan. A merchant override can switch a single module on top, or start a time-boxed trial of one.</p>
            <div className="card" style={{ marginTop: "26px", padding: "10px 28px 18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", padding: "12px 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
                <span>Set</span>
                <span>Modules</span>
                <span>Growth</span>
                <span>Business</span>
                <span>Enterprise</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Platform core</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Runs in every store, never sold separately</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Multi-tenancy and provisioning" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>F1</span>
                  <span className="mono" title="Plans, segments and entitlement" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>F3</span>
                  <span className="mono" title="Subscription billing" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>F2</span>
                  <span className="mono" title="Admin interface and design system" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>B1</span>
                  <span className="mono" title="Users, roles and security" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S4</span>
                  <span className="mono" title="Business setup and onboarding" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S8</span>
                  <span className="mono" title="Merchant notification centre" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S9</span>
                  <span className="mono" title="Transactional notifications" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S3</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Everyday core</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Every segment, every plan</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Dashboard" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M01</span>
                  <span className="mono" title="Reports and profitability" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S2</span>
                  <span className="mono" title="Products" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M07</span>
                  <span className="mono" title="Stock ledger" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M15</span>
                  <span className="mono" title="Customer record" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S1</span>
                  <span className="mono" title="Customer page and CRM" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M22</span>
                  <span className="mono" title="Payments and settlement" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M17</span>
                  <span className="mono" title="Staff profile and access" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M24</span>
                  <span className="mono" title="Returns and exchanges" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M18</span>
                  <span className="mono" title="Support tickets" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S7</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Online set</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Online segment</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Checkout and accounts" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M06</span>
                  <span className="mono" title="Online orders" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M02</span>
                  <span className="mono" title="Manual online order" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M25</span>
                  <span className="mono" title="Quick order link" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M23</span>
                  <span className="mono" title="Bulk order actions" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M26</span>
                  <span className="mono" title="Courier, delivery and COD" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M08</span>
                  <span className="mono" title="Themes" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M11</span>
                  <span className="mono" title="Landing pages" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M12</span>
                  <span className="mono" title="SEO" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M10</span>
                  <span className="mono" title="Reviews and ratings" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M09</span>
                  <span className="mono" title="Server-side tracking" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G1</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Retail set</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Retail segment</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="POS terminal" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M04</span>
                  <span className="mono" title="Counter sales entry" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M03</span>
                  <span className="mono" title="Cash and expenses" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M16</span>
                  <span className="mono" title="Warranty policies" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M28</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Wholesale set</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Wholesale segment</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Purchasing and suppliers" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M13</span>
                  <span className="mono" title="Wholesale and receivables" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M14</span>
                  <span className="mono" title="Partners and profit sharing" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M27</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Grow set</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Offers, loyalty, recovery, analytics</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Promotions and offers" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M21</span>
                  <span className="mono" title="Loyalty and affiliates" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M20</span>
                  <span className="mono" title="Cart recovery" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G4</span>
                  <span className="mono" title="Analytics hub" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G2</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
</span>Locked, upgrade offered</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Scale set</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Stock across locations, people, custom plans</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Warehouses" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M05</span>
                  <span className="mono" title="HR, payroll and attendance" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>M19</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
</span>Locked, upgrade offered</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
</span>Locked, upgrade offered</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "var(--radius-full)", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.14)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
</span>Included</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Credit add-ons</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Bought as credits on any plan</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Inbox and automation" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G3</span>
                  <span className="mono" title="SMS, email, WhatsApp blast" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G6</span>
                  <span className="mono" title="AI product creation" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>G5</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 170px 170px 190px", gap: "18px", alignItems: "center", padding: "16px 0", borderTop: "1px solid #eef2f6" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Service add-on</div>
                  <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Assisted migration as a managed service</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className="mono" title="Migration" style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 7px", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#334155", fontWeight: "var(--weight-medium)" }}>S6</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Add-on</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: "14px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", marginRight: "6px" }}>Metered limits on every plan version</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Orders per month</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Products</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Staff seats</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Storage</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Courier connections</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "34px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#334155" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
</svg>Landing pages</span>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Entitlement check</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Two questions, asked on every screen, route, API call and job</h2>
            <div className="card" style={{ marginTop: "26px", padding: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr 48px 1fr 48px 1fr", alignItems: "start", gap: "0" }}>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Request</div>
                  <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#012169", border: "1.5px solid #012169" }}>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>Merchant opens a feature</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "#a9bddc" }}>A screen, a route, an API call or a background job</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087", marginBottom: "6px" }}>Question 1</div>
                  <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px solid #003087" }}>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Is the module on?</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "var(--text-muted)" }}>Plan version, then segment, then merchant override</div>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#c2410c", marginBottom: "6px" }}>If no</div>
                    <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff4ef", border: "1.5px solid rgba(255,87,36,.4)" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Locked screen</div>
                      <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "var(--text-muted)" }}>Plain message, one-click upgrade or a trial of that one module</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087", marginBottom: "6px" }}>Question 2</div>
                  <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px solid #003087" }}>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Is there limit left?</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "var(--text-muted)" }}>Usage counter for this period against the plan limit</div>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#a45100", marginBottom: "6px" }}>Near the limit</div>
                    <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "rgba(255,152,0,.10)", border: "1.5px solid rgba(255,152,0,.45)" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Warn, then block</div>
                      <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "var(--text-muted)" }}>Banner first; at the limit, offer a top-up or upgrade</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#047857", marginBottom: "6px" }}>Allowed</div>
                  <div style={{ padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "rgba(16,185,129,.1)", border: "1.5px solid rgba(16,185,129,.4)" }}>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Run and meter</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.45", color: "var(--text-muted)" }}>Action runs; the usage counter and audit log are written</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Subscription lifecycle</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "var(--text-3xl)", lineHeight: "1.15", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", textWrap: "balance" }}>Eight states, graduated access, and no store ever deleted for a missed payment</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "var(--text-sm-plus)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Each change records a reason code, the actor and the time. Collection runs through bKash, Nagad and card on the payment gateways already built, with a manual path that rejects a duplicate transaction ID.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: "12px", marginTop: "26px" }}>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>01</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Trial</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Full access</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>15 days; clock starts at store publish or first real order</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>02</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Active</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Full access</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Charged monthly or yearly</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>03</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Grace</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Full access and a banner</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Payment failed; retries and notices running</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>04</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Past due</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff9800" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Admin read-only</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Storefront keeps taking orders</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>05</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Paused</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#64748b" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#64748b" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Storefront paused</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Set by the merchant or on a schedule</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>06</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Suspended</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#ff5724" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Admin and storefront off</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Data kept; reactivation restores everything</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>07</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Cancelled</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#64748b" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Export offered</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Reason captured at cancellation</div>
              </div>
              <div className="card" style={{ padding: "18px 16px", position: "relative" }}>
                <div className="mono num" style={{ color: "var(--text-muted)" }}>08</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Archived</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", marginTop: "12px" }}>
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                  <span style={{ width: "100%", height: "6px", borderRadius: "var(--radius-md)", background: "#e2e8f0" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Stored</div>
                <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", lineHeight: "1.45", color: "var(--text-muted)" }}>Restorable on reactivation without a rebuild</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "inline-grid", gridTemplateColumns: "repeat(4,14px)", gap: "3px" }}>
  <span style={{ height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
  <span style={{ height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
  <span style={{ height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
  <span style={{ height: "6px", borderRadius: "var(--radius-md)", background: "#10b981" }} />
</span>Bars show how much of the store stays usable in each state</div>
            <div className="card" style={{ marginTop: "18px", padding: "22px 24px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Transitions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Trial</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Active</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Trial ends, day 16 first charge</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Active</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Grace</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Charge fails</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Grace</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Past due</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Grace period ends unpaid</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Past due</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Suspended</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Still unpaid</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Grace or past due</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Active</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Paid, access restored at once</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Active</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Paused</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Merchant pauses</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Active</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Cancelled</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>Merchant cancels</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Suspended or cancelled</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Archived</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", textAlign: "right" }}>After the retention period</span>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "56px 80px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "14px" }}>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ color: "#047857" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20M6 15h4" />
                  </svg>
                </div>
                <div style={{ marginTop: "12px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Collect</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--text-muted)" }}>Recurring bKash, Nagad and card; manual payment with transaction ID and screenshot</div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ color: "#047857" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
                <div style={{ marginTop: "12px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Prorate</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--text-muted)" }}>Upgrade or downgrade any time, proration shown before confirming, no data loss</div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ color: "#047857" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                    <path d="M4 21h16M9 12h.01" />
                  </svg>
                </div>
                <div style={{ marginTop: "12px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Approve</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--text-muted)" }}>Bill edits need a reason code; a second person above the threshold</div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ color: "#047857" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" />
                  </svg>
                </div>
                <div style={{ marginTop: "12px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Correct</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--text-muted)" }}>Credit notes, never silent edits; refunds and credits recorded</div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ color: "#047857" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                </div>
                <div style={{ marginTop: "12px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Trace</div>
                <div style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--text-muted)" }}>Immutable billing audit trail, full history and invoice downloads</div>
              </div>
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
