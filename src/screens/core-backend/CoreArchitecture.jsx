'use client';
// Generated from design/templates/core-backend/CoreArchitecture.dc.html by scripts/convert-design.mjs.
// Architecture · request lifecycle and data model
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
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.lift{transition:transform 220ms cubic-bezier(.23,1,.32,1),box-shadow 220ms cubic-bezier(.23,1,.32,1)}
.lift:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(15,23,42,.05),0 16px 32px -14px rgba(15,23,42,.22)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:background-color 180ms ease,color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,.stepbtn:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.stepbtn{display:flex;width:100%;align-items:center;gap:14px;min-height:64px;padding:10px 14px;border:0;border-radius:12px;background:transparent;font:inherit;text-align:left;cursor:pointer;color:#334155;transition:background-color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.stepbtn:hover{background:#f1f5f9}
.stepbtn:active{transform:scale(.98)}
.stepbtn.on{background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.05),0 8px 20px -10px rgba(15,23,42,.25)}
@media (prefers-reduced-motion: reduce){.lift,.btn,.stepbtn{transition:none}.lift:hover{transform:none}.btn:active,.stepbtn:active{transform:none}}
`;

// ---- markup ----

export default class CoreArchitectureScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CoreArchitecture">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "3500px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "64px 80px 64px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-120px", top: "-160px", width: "520px", height: "520px", borderRadius: "9999px", border: "1px solid rgba(127,212,245,.18)" }} />
            <div style={{ position: "absolute", right: "-40px", top: "-80px", width: "360px", height: "360px", borderRadius: "9999px", border: "1px solid rgba(127,212,245,.14)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".22em", textTransform: "uppercase", color: "#7fd4f5" }}>Platform core · Architecture</p>
              <h1 style={{ margin: "14px 0 0", maxWidth: "900px", fontSize: "52px", lineHeight: "1.06", fontWeight: "700", letterSpacing: "-.03em", color: "#fff", textWrap: "balance" }}>How a request reaches a module</h1>
              <p style={{ margin: "18px 0 0", maxWidth: "760px", fontSize: "17px", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>One resolver, one identity layer and one entitlement check sit in front of every module. Stack stays Laravel and Next.js on the existing codebase.</p>
            </div>
          </header>
          <nav aria-label="Plan boards" style={{ display: "flex", gap: "10px", padding: "32px 80px 0" }}>
            <__Link href="/core-plan" className="btn ghost">← Build plan overview</__Link>
            <__Link href="/core-packaging" className="btn ghost">Packaging and billing</__Link>
          </nav>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0089c3" }}>Request lifecycle</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>Every entry point passes the same four checks</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "15px", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Web requests, API calls, webhooks, queued jobs and scheduled tasks all resolve a tenant before anything else runs. A check that fails stops the request with a clear screen, never a wrong store.</p>
            <div className="card" style={{ marginTop: "26px", padding: "32px 40px" }}>
              <svg width="1280" height="520" viewBox="0 0 1280 520" role="img" aria-label="Request lifecycle through the platform core" style={{ display: "block", fontFamily: "Poppins,system-ui,sans-serif" }}>
                <defs>
                  <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 10 5 0 10Z" fill="#94a3b8" />
                  </marker>
                  <marker id="arn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 10 5 0 10Z" fill="#003087" />
                  </marker>
                </defs>
                <rect x="0" y="40" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="63" fontSize="13.5" fontWeight="600" fill="#0f172a">Storefront visit</text>
                <text x="18" y="81" fontSize="11.5" fill="#64748b">storename. or own domain</text>
                <path d="M224 67 C 246 67, 246 67, 262 67" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <rect x="0" y="108" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="131" fontSize="13.5" fontWeight="600" fill="#0f172a">Admin and POS</text>
                <text x="18" y="149" fontSize="11.5" fill="#64748b">app.gridcommerce.com.bd</text>
                <path d="M224 135 C 246 135, 246 135, 262 135" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <rect x="0" y="176" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="199" fontSize="13.5" fontWeight="600" fill="#0f172a">API call</text>
                <text x="18" y="217" fontSize="11.5" fill="#64748b">token issued per store</text>
                <path d="M224 203 C 246 203, 246 203, 262 203" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <rect x="0" y="244" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="267" fontSize="13.5" fontWeight="600" fill="#0f172a">Webhook</text>
                <text x="18" y="285" fontSize="11.5" fill="#64748b">courier, gateway, Meta</text>
                <path d="M224 271 C 246 271, 246 271, 262 271" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <rect x="0" y="312" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="335" fontSize="13.5" fontWeight="600" fill="#0f172a">Queued job</text>
                <text x="18" y="353" fontSize="11.5" fill="#64748b">carries its tenant</text>
                <path d="M224 339 C 246 339, 246 339, 262 339" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <rect x="0" y="380" width="224" height="54" rx="12" fill="#fff" stroke="#e2e8f0" />
                <text x="18" y="403" fontSize="13.5" fontWeight="600" fill="#0f172a">Scheduled task</text>
                <text x="18" y="421" fontSize="11.5" fill="#64748b">runs once per tenant</text>
                <path d="M224 407 C 246 407, 246 407, 262 407" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <path d="M262 67 V 407" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M262 237 H 296" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ar)" />
                <rect x="300" y="175" width="170" height="124" rx="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="316" y="203" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#64748b">STAGE 1</text>
                <text x="316" y="229" fontSize="15" fontWeight="600" fill="#0f172a">Edge and</text>
                <text x="316" y="249" fontSize="15" fontWeight="600" fill="#0f172a">domain map</text>
                <text x="316" y="279" fontSize="11" fill="#64748b">TLS, host lookup, HTTPS</text>
                <path d="M472 237 H 493" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <rect x="496" y="175" width="170" height="124" rx="14" fill="#012169" stroke="#012169" strokeWidth="1.5" />
                <text x="512" y="203" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#7fd4f5">STAGE 2</text>
                <text x="512" y="229" fontSize="15" fontWeight="600" fill="#ffffff">Tenant resolver</text>
                <text x="512" y="279" fontSize="11" fill="#a9bddc">F1 · sets tenant context</text>
                <path d="M668 237 H 689" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <path d="M581.0 175 V 149" stroke="#ff5724" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="496" y="97" width="170" height="52" rx="10" fill="#fff4ef" stroke="rgba(255,87,36,.35)" />
                <text x="508" y="119" fontSize="11.5" fontWeight="600" fill="#c2410c">Unknown host</text>
                <text x="508" y="137" fontSize="11" fill="#7c2d12">→ store not found</text>
                <rect x="692" y="175" width="170" height="124" rx="14" fill="#012169" stroke="#012169" strokeWidth="1.5" />
                <text x="708" y="203" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#7fd4f5">STAGE 3</text>
                <text x="708" y="229" fontSize="15" fontWeight="600" fill="#ffffff">Identity and</text>
                <text x="708" y="249" fontSize="15" fontWeight="600" fill="#ffffff">role</text>
                <text x="708" y="279" fontSize="11" fill="#a9bddc">S4 · user, role, 2FA</text>
                <path d="M864 237 H 885" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <path d="M777.0 175 V 149" stroke="#ff5724" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="692" y="97" width="170" height="52" rx="10" fill="#fff4ef" stroke="rgba(255,87,36,.35)" />
                <text x="704" y="119" fontSize="11.5" fontWeight="600" fill="#c2410c">No permission</text>
                <text x="704" y="137" fontSize="11" fill="#7c2d12">→ blocked and logged</text>
                <rect x="888" y="175" width="170" height="124" rx="14" fill="#012169" stroke="#012169" strokeWidth="1.5" />
                <text x="904" y="203" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#7fd4f5">STAGE 4</text>
                <text x="904" y="229" fontSize="15" fontWeight="600" fill="#ffffff">Entitlement</text>
                <text x="904" y="279" fontSize="11" fill="#a9bddc">F3 · module on, limit left</text>
                <path d="M1060 237 H 1081" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <path d="M973.0 175 V 149" stroke="#ff5724" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="888" y="97" width="170" height="52" rx="10" fill="#fff4ef" stroke="rgba(255,87,36,.35)" />
                <text x="900" y="119" fontSize="11.5" fontWeight="600" fill="#c2410c">Off or over limit</text>
                <text x="900" y="137" fontSize="11" fill="#7c2d12">→ locked screen with upgrade</text>
                <rect x="1084" y="175" width="170" height="124" rx="14" fill="#ffffff" stroke="#009cde" strokeWidth="1.5" />
                <text x="1100" y="203" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#0089c3">STAGE 5</text>
                <text x="1100" y="229" fontSize="15" fontWeight="600" fill="#0f172a">Module</text>
                <text x="1100" y="279" fontSize="11" fill="#64748b">One of the 48, tenant-scoped</text>
                <path d="M1169.0 299 V 333" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <rect x="860" y="337" width="420" height="66" rx="12" fill="#f5fbfe" stroke="rgba(0,156,222,.35)" />
                <text x="878" y="363" fontSize="13.5" fontWeight="600" fill="#00567a">Shared engines</text>
                <text x="878" y="384" fontSize="11.5" fill="#00709f">Products · stock ledger · payments · customers · promotions · notifications · tracking</text>
                <path d="M1169.0 403 V 429" stroke="#003087" strokeWidth="2" markerEnd="url(#arn)" />
                <rect x="860" y="433" width="420" height="66" rx="12" fill="#0f172a" />
                <text x="878" y="459" fontSize="13.5" fontWeight="600" fill="#fff">Tenant-scoped data</text>
                <text x="878" y="480" fontSize="11.5" fill="#94a3b8">Database rows · files · cache · search · queues · backups</text>
                <rect x="300" y="337" width="530" height="162" rx="14" fill="#fff" stroke="#e2e8f0" />
                <path d="M777.0 299 V 335" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M973.0 299 V 317 H 815 V 335" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <text x="320" y="367" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#047857">EVERY REQUEST ALSO WRITES</text>
                <rect x="320" y="383" width="156" height="62" rx="10" fill="rgba(16,185,129,.08)" />
                <text x="332" y="407" fontSize="13" fontWeight="600" fill="#065f46">Audit log</text>
                <text x="332" y="427" fontSize="10.5" fill="#047857">who did what, in which store</text>
                <rect x="490" y="383" width="156" height="62" rx="10" fill="rgba(16,185,129,.08)" />
                <text x="502" y="407" fontSize="13" fontWeight="600" fill="#065f46">Usage meters</text>
                <text x="502" y="427" fontSize="10.5" fill="#047857">orders, products, seats, storage</text>
                <rect x="660" y="383" width="156" height="62" rx="10" fill="rgba(16,185,129,.08)" />
                <text x="672" y="407" fontSize="13" fontWeight="600" fill="#065f46">Health events</text>
                <text x="672" y="427" fontSize="10.5" fill="#047857">errors, latency, integration status</text>
                <text x="320" y="475" fontSize="12.5" fill="#334155">→ read by the platform console (S5) and the support desk (S7)</text>
              </svg>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0089c3" }}>Core data model</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>About thirty new tables, in five groups</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "15px", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Everything the core adds lives beside the module tables, not inside them. Module tables only gain the tenant key.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "16px", marginTop: "26px" }}>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: "5px", background: "#003087" }} />
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Tenancy</h3>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "500", color: "#003087" }}>Step 2 and 4</div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>tenants</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>id, name, segment, status, plan_version_id</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>tenant_domains</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, host, verified_at, cert_expires_at</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>provisioning_runs</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, stage, status, error</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>tenant_backups</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, taken_at, restorable</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: "5px", background: "#003087" }} />
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Identity and audit</h3>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "500", color: "#003087" }}>Step 3</div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>users</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>id, phone, email, 2fa</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>memberships</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>user_id, tenant_id, role_id</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>roles · permissions</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, screen, action</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>platform_staff</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>console users, separate sign-in</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>audit_logs</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, actor, action, before, after</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: "5px", background: "#009cde" }} />
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Catalogue and entitlement</h3>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "500", color: "#00709f" }}>Step 5 and 6</div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>features</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>key, module, group</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>plans · plan_versions</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>ladder, segment, price, version</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>plan_features · plan_limits</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>version_id, feature, limit</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>tenant_overrides</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, feature, value, reason</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>usage_counters</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, limit_key, period, used</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: "5px", background: "#10b981" }} />
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Billing</h3>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "500", color: "#047857" }}>Step 7</div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>billing_accounts</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, method, mandate</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>subscriptions</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, state, trial_ends, renews_at</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>invoices · invoice_lines</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>number, amount, status</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>billing_payments</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>gateway, txn_id unique, proof</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>credit_notes · dunning_events</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>reason_code, approved_by</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: "5px", background: "#10b981" }} />
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Monitoring</h3>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "500", color: "#047857" }}>Step 8</div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>health_snapshots</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, score, signals, day</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>usage_daily</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, db, storage, bandwidth, queue</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>integration_checks</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>tenant_id, provider, status</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>alerts · incidents</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>severity, responder, linked tickets</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "2px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                      <span className="mono" style={{ fontWeight: "500", color: "#0f172a" }}>notices</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#64748b" }}>audience, channel, schedule, expiry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0089c3" }}>Shared engines</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>Who owns each engine, and who calls it</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "720px", fontSize: "15px", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Engines with the most callers are retrofitted first in step 9. The bar shows reach across the modules.</p>
            <div className="card" style={{ marginTop: "26px", padding: "12px 28px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", padding: "10px 0", fontSize: "11.5px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>
                <span>Engine</span>
                <span>Owner</span>
                <span>Called by</span>
                <span>Reach</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Tenant resolver</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "#012169", color: "#fff", fontWeight: "500" }}>F1</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#334155", marginRight: "6px" }}>Every request, job, scheduled task and webhook</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "100%", background: "#003087", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>all</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Entitlement service</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "#012169", color: "#fff", fontWeight: "500" }}>F3</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#334155", marginRight: "6px" }}>Every screen, route and limit check</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "100%", background: "#003087", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>all</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Roles and audit</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "#012169", color: "#fff", fontWeight: "500" }}>S4</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#334155", marginRight: "6px" }}>Every screen; approvals in</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M04</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M16</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M13</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M17</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "40%", background: "#003087", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>5</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Stock ledger</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>M15</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M02</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M04</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M14</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M13</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M18</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M05</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>S8</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>S6</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "72%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>9</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Payment service</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>M17</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M06</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M12</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M04</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M14</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M18</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M16</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M20</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>F2</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G5</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G6</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "88%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>11</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Customer record</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>S1</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M22</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M06</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M04</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M12</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M14</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M18</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M20</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G3</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G4</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G6</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>S7</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "96%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>12</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Promotions engine</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>M21</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M06</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M12</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M04</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M20</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G4</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G6</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "56%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>7</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Notification service</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>S3</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M02</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M03</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M08</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M09</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M15</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M17</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M14</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M19</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M20</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>F2</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>F3</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "88%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>11</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "230px 80px minmax(0,1fr) 120px", gap: "16px", alignItems: "center", padding: "14px 0", borderTop: "1px solid #eef2f6" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Event tracking</span>
                <span className="mono" style={{ display: "inline-flex", height: "26px", alignItems: "center", padding: "0 9px", borderRadius: "7px", background: "rgba(0,156,222,.12)", color: "#00567a", fontWeight: "500" }}>G1</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M11</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M12</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M06</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M02</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M08</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>M18</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G2</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>G4</span>
                  <span className="mono" style={{ display: "inline-flex", height: "22px", alignItems: "center", padding: "0 7px", borderRadius: "6px", background: "#f1f5f9", color: "#334155" }}>B2</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "1", height: "6px", borderRadius: "6px", background: "#eef2f6", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: "72%", background: "#009cde", borderRadius: "6px" }} />
                  </span>
                  <span className="num mono" style={{ color: "#64748b", width: "24px", textAlign: "right" }}>9</span>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0089c3" }}>Technical ground rules</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>Targets every step is tested against</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px", marginTop: "26px" }}>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Isolation</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Every merchant-owned record tenant-scoped</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>proven by automated tests on every change</div>
              </div>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Money and stock</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Transactionally safe</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>and auditable end to end</div>
              </div>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8ZM12 18v4" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Outside calls</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Idempotency keys</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>timeouts, retry with backoff, visible failure queue</div>
              </div>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Storefront</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>under 2.5 s</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>mid-range Android over 4G</div>
              </div>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>API p95</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>300 ms read · 800 ms write</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>admin pages under 2 s</div>
              </div>
              <div className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#003087" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Availability</span>
                </div>
                <div className="num" style={{ marginTop: "14px", fontSize: "22px", lineHeight: "1.25", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>99.9 percent monthly</div>
                <div style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.5", color: "#64748b" }}>error rate under 0.1 percent</div>
              </div>
            </div>
          </section>
          <footer style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", background: "#012169", color: "#cbd8ee", fontSize: "13px" }}>
            <span style={{ fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#fff" }}>GridCommerce · Platform core</span>
            <span>Build specification V2.6 · Core backend plan</span>
          </footer>
        </div>
      </div>
    );
  }
}
