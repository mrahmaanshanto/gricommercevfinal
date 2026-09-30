'use client';
// Generated from design/templates/core-backend/CoreMonitoring.dc.html by scripts/convert-design.mjs.
// S5 · Merchant monitoring console
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

export default class CoreMonitoringScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CoreMonitoring">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1580px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <aside style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "248px", background: "#012169", padding: "26px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ padding: "0 10px 22px" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-.02em", color: "#fff" }}>GridCommerce</div>
              <div className="mono" style={{ marginTop: "2px", color: "#7fd4f5" }}>console.gridcommerce.com.bd</div>
            </div>
            <nav aria-label="Console" style={{ display: "grid", gap: "2px" }}>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
</span>Overview</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", background: "rgba(127,212,245,.14)", color: "#fff" }}><span style={{ color: "#7fd4f5" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
    <path d="M5 12v9h14v-9" />
  </svg>
</span>Tenants</a>
              <div style={{ display: "grid", gap: "2px", margin: "2px 0 6px 44px", paddingLeft: "12px", borderLeft: "1.5px solid rgba(169,189,220,.25)" }}>
                <a href="#" style={{ display: "flex", alignItems: "center", minHeight: "34px", padding: "0 10px", borderRadius: "8px", fontSize: "13px", background: "rgba(127,212,245,.18)", color: "#fff", fontWeight: "600" }}>Merchants</a>
                <a href="#" style={{ display: "flex", alignItems: "center", minHeight: "34px", padding: "0 10px", borderRadius: "8px", fontSize: "13px", color: "#a9bddc" }}>Provisioning</a>
                <a href="#" style={{ display: "flex", alignItems: "center", minHeight: "34px", padding: "0 10px", borderRadius: "8px", fontSize: "13px", color: "#a9bddc" }}>Domains</a>
                <a href="#" style={{ display: "flex", alignItems: "center", minHeight: "34px", padding: "0 10px", borderRadius: "8px", fontSize: "13px", color: "#a9bddc" }}>Backups</a>
              </div>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
</span>Packaging</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
</span>Billing</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
</span>Monitoring</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" />
  </svg>
</span>Support</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
</span>Sales CRM</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="8" rx="2" />
    <rect x="3" y="13" width="18" height="8" rx="2" />
    <path d="M7 7h.01M7 17h.01" />
  </svg>
</span>Operations</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "40px", padding: "0 14px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", color: "#a9bddc" }}><span style={{ color: "#6683b7" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
</span>System</a>
            </nav>
            <div style={{ marginTop: "auto", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,.06)", fontSize: "12px", lineHeight: "1.5", color: "#a9bddc" }}>Signed in as platform staff. Every view of a merchant is logged.</div>
          </aside>
          <main style={{ position: "absolute", left: "248px", right: "0", top: "0", bottom: "0", padding: "24px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <label style={{ position: "relative", flex: "0 1 420px" }}>
                <span style={{ position: "absolute", left: "14px", top: "12px", color: "#94a3b8" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search merchants</span>
                <input type="search" placeholder="Search merchant, domain or phone" style={{ width: "100%", height: "44px", padding: "0 14px 0 42px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", font: "inherit", fontSize: "14px", color: "#0f172a" }} />
              </label>
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "32px", padding: "0 12px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", fontSize: "12.5px", fontWeight: "600" }}><span style={{ width: "8px", height: "8px", borderRadius: "9px", background: "#10b981" }} />Production</span>
              <button className="btn solid"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10 21h4" />
</svg>Compose notice</button>
            </div>
            <div>
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0089c3" }}>S5 · Merchant monitoring</p>
              <h1 style={{ margin: "6px 0 0", fontSize: "30px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a" }}>Merchants</h1>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "14px" }}>
              <div className="card" style={{ padding: "18px 18px 14px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>Active merchants</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
                  <span className="num" style={{ fontSize: "28px", lineHeight: "1", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>44</span>
                  <svg width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
                    <path d="M0.0 32.0 L17.1 28.9 L34.3 25.8 L51.4 22.7 L68.6 18.0 L85.7 13.3 L102.9 8.7 L120.0 4.0 L120 34 L0 34Z" fill="#003087" opacity=".12" />
                    <path d="M0.0 32.0 L17.1 28.9 L34.3 25.8 L51.4 22.7 L68.6 18.0 L85.7 13.3 L102.9 8.7 L120.0 4.0" fill="none" stroke="#003087" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>+6 this month</div>
              </div>
              <div className="card" style={{ padding: "18px 18px 14px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>In trial</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
                  <span className="num" style={{ fontSize: "28px", lineHeight: "1", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>18</span>
                  <svg width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
                    <path d="M0.0 32.0 L17.1 25.8 L34.3 16.4 L51.4 22.7 L68.6 13.3 L85.7 10.2 L102.9 4.0 L120.0 7.1 L120 34 L0 34Z" fill="#009cde" opacity=".12" />
                    <path d="M0.0 32.0 L17.1 25.8 L34.3 16.4 L51.4 22.7 L68.6 13.3 L85.7 10.2 L102.9 4.0 L120.0 7.1" fill="none" stroke="#009cde" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>7 publish this week</div>
              </div>
              <div className="card" style={{ padding: "18px 18px 14px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>Recurring revenue</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
                  <span className="num" style={{ fontSize: "28px", lineHeight: "1", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>৳88,000</span>
                  <svg width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
                    <path d="M0.0 32.0 L17.1 27.3 L34.3 22.7 L51.4 21.1 L68.6 17.2 L85.7 12.6 L102.9 8.7 L120.0 4.0 L120 34 L0 34Z" fill="#10b981" opacity=".12" />
                    <path d="M0.0 32.0 L17.1 27.3 L34.3 22.7 L51.4 21.1 L68.6 17.2 L85.7 12.6 L102.9 8.7 L120.0 4.0" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>per month</div>
              </div>
              <div className="card" style={{ padding: "18px 18px 14px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>At risk</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
                  <span className="num" style={{ fontSize: "28px", lineHeight: "1", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>5</span>
                  <svg width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
                    <path d="M0.0 32.0 L17.1 25.0 L34.3 25.0 L51.4 18.0 L68.6 25.0 L85.7 18.0 L102.9 4.0 L120.0 11.0 L120 34 L0 34Z" fill="#ff5724" opacity=".12" />
                    <path d="M0.0 32.0 L17.1 25.0 L34.3 25.0 L51.4 18.0 L68.6 25.0 L85.7 18.0 L102.9 4.0 L120.0 11.0" fill="none" stroke="#ff5724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>2 with failed payment</div>
              </div>
              <div className="card" style={{ padding: "18px 18px 14px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>Open incidents</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
                  <span className="num" style={{ fontSize: "28px", lineHeight: "1", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>1</span>
                  <svg width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
                    <path d="M0.0 32.0 L17.1 18.0 L34.3 32.0 L51.4 32.0 L68.6 4.0 L85.7 18.0 L102.9 32.0 L120.0 18.0 L120 34 L0 34Z" fill="#ff9800" opacity=".12" />
                    <path d="M0.0 32.0 L17.1 18.0 L34.3 32.0 L51.4 32.0 L68.6 4.0 L85.7 18.0 L102.9 32.0 L120.0 18.0" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>Steadfast webhook delays</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "16px", alignItems: "start" }}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px" }}>
                    <button className="btn" style={{ minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", background: "#003087", color: "#fff" }}>All<span className="num" style={{ opacity: ".7" }}>62</span></button>
                    <button className="btn" style={{ minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}>Trial<span className="num" style={{ opacity: ".7" }}>18</span></button>
                    <button className="btn" style={{ minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}>At risk<span className="num" style={{ opacity: ".7" }}>5</span></button>
                    <button className="btn" style={{ minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}>Past due<span className="num" style={{ opacity: ".7" }}>2</span></button>
                    <button className="btn" style={{ minHeight: "36px", padding: "0 14px", borderRadius: "999px", fontSize: "13px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}>Stalled setup<span className="num" style={{ opacity: ".7" }}>4</span></button>
                    <span style={{ marginLeft: "auto", fontSize: "12.5px", color: "#64748b" }}>Health refreshed 4 min ago</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", padding: "10px 16px", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>
                    <span>Merchant</span>
                    <span>Status</span>
                    <span>Activation</span>
                    <span>Health</span>
                    <span>Orders vs limit</span>
                    <span>Warnings</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Rongdhonu Fashion</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Online · Business</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Active</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="7.5" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>92%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#047857" }}>Healthy</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>86</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "86%", height: "100%", borderRadius: "6px", background: "#10b981" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>1,840</b> / 2,500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "74%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>None</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Shonali Crafts</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Online · Retail · Growth</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Active</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="0.0" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>100%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#047857" }}>Healthy</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>78</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "78%", height: "100%", borderRadius: "6px", background: "#10b981" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>410</b> / 500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "82%", height: "100%", borderRadius: "6px", background: "#ff9800" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>82% of order limit</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6", background: "rgba(0,48,135,.05)", boxShadow: "inset 3px 0 0 #003087" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dhaka Gadget Hub</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Retail · Business</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#fff4e0", color: "#a45100", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Grace</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="11.3" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>88%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#a45100" }}>Watch</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>54</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "54%", height: "100%", borderRadius: "6px", background: "#ff9800" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>960</b> / 2,500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "38%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>Payment failed</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>Courier failing</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Nodi Organic</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Online · Growth</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Trial</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="51.8" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>45%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#c2410c" }}>At risk</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>41</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "41%", height: "100%", borderRadius: "6px", background: "#ff5724" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>12</b> / 500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "2%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>Stalled setup</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>No orders 6 days</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mohona Traders</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Wholesale · Enterprise</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#e7f8f1", color: "#047857", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Active</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="3.8" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>96%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#047857" }}>Healthy</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>90</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "90%", height: "100%", borderRadius: "6px", background: "#10b981" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>3,120</b> / 10,000</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "31%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>None</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Bindu Beauty</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Online · Business</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Past due</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="24.5" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>74%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#c2410c" }}>At risk</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>33</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "33%", height: "100%", borderRadius: "6px", background: "#ff5724" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>640</b> / 2,500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "26%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>Read-only</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", padding: "0 8px", borderRadius: "999px", background: "#fff4ef", color: "#c2410c", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3 2 21h20L12 3Z" />
  <path d="M12 10v5M12 18h.01" />
</svg>No login 9 days</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 88px 92px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr)", gap: "12px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #eef2f6" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kolpo Books</div>
                      <div style={{ marginTop: "2px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Online · Retail · Growth</div>
                    </div>
                    <span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "rgba(0,156,222,.12)", color: "#00567a", fontSize: "11.5px", fontWeight: "600", whiteSpace: "nowrap" }}>Trial</span>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="30.2" transform="rotate(-90 19 19)" />
                      </svg>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>68%</span>
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", color: "#a45100" }}>Watch</span>
                        <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>72</span>
                      </div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "72%", height: "100%", borderRadius: "6px", background: "#ff9800" }} />
                      </div>
                    </div>
                    <div>
                      <div className="num" style={{ fontSize: "12px", color: "#334155" }}><b style={{ fontWeight: "600", color: "#0f172a" }}>48</b> / 500</div>
                      <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                        <div style={{ width: "10%", height: "100%", borderRadius: "6px", background: "#003087" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>None</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "16px" }}>
                  <div className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Trial funnel</h3>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Last 90 days</span>
                    </div>
                    <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 44px", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>Signups</span>
                        <div style={{ height: "26px", borderRadius: "7px", background: "#f1f5f9" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "7px", background: "#99accf" }} />
                        </div>
                        <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textAlign: "right" }}>96</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 44px", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>Trials started</span>
                        <div style={{ height: "26px", borderRadius: "7px", background: "#f1f5f9" }}>
                          <div style={{ width: "74%", height: "100%", borderRadius: "7px", background: "#6683b7" }} />
                        </div>
                        <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textAlign: "right" }}>71</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 44px", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>Activated</span>
                        <div style={{ height: "26px", borderRadius: "7px", background: "#f1f5f9" }}>
                          <div style={{ width: "54%", height: "100%", borderRadius: "7px", background: "#2e559d" }} />
                        </div>
                        <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textAlign: "right" }}>52</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 44px", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>Converted to paid</span>
                        <div style={{ height: "26px", borderRadius: "7px", background: "#f1f5f9" }}>
                          <div style={{ width: "40%", height: "100%", borderRadius: "7px", background: "#003087" }} />
                        </div>
                        <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", textAlign: "right" }}>38</span>
                      </div>
                    </div>
                  </div>
                  <div className="card" style={{ padding: "20px" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Where setup stalls</h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #eef2f6", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155" }}>Courier not connected</span>
                      <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>7</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #eef2f6", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155" }}>No products added</span>
                      <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>5</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #eef2f6", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155" }}>Payment method missing</span>
                      <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>4</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #eef2f6", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155" }}>Domain not verified</span>
                      <span className="num" style={{ fontWeight: "600", color: "#0f172a" }}>3</span>
                    </div>
                  </div>
                </div>
              </div>
              <aside className="card" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", height: "24px", alignItems: "center", padding: "0 9px", borderRadius: "999px", background: "#fff4e0", color: "#a45100", fontSize: "11.5px", fontWeight: "600" }}>Grace · day 3</span>
                  <span className="mono" style={{ color: "#94a3b8" }}>tenant 0031</span>
                </div>
                <h2 style={{ margin: "12px 0 0", fontSize: "21px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Dhaka Gadget Hub</h2>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Retail · Business · since 05 Aug 2026</div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "18px", padding: "16px", borderRadius: "14px", background: "#f8fafc" }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#ff9800" strokeWidth="7" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="86.7" transform="rotate(-90 36 36)" />
                    <text x="36" y="42" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a" fontFamily="Poppins">54</text>
                  </svg>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#a45100" }}>Watch</div>
                    <div style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#64748b", marginTop: "2px" }}>Down 21 points in 7 days. Billing and courier signals are pulling it down.</div>
                  </div>
                </div>
                <h3 style={{ margin: "18px 0 4px", fontSize: "11.5px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Health signals</h3>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Activation <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>S8</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#047857" }}>88</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Setup steps and first transactions</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "88%", height: "100%", borderRadius: "6px", background: "#10b981" }} />
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Activity <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>M02 · M03</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#a45100" }}>62</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Logins and orders against its own normal</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "62%", height: "100%", borderRadius: "6px", background: "#ff9800" }} />
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Billing <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>F2</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#c2410c" }}>20</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Payment status and dunning stage</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "20%", height: "100%", borderRadius: "6px", background: "#ff5724" }} />
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Integrations <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>M08 · M17 · G1</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#c2410c" }}>35</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Couriers, gateways, SMS, WhatsApp, Meta</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "35%", height: "100%", borderRadius: "6px", background: "#ff5724" }} />
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Technical <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>S5</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#047857" }}>81</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Errors and slow queries in this store</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "81%", height: "100%", borderRadius: "6px", background: "#10b981" }} />
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Support <span className="mono" style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "400" }}>S7</span></span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "600", color: "#a45100" }}>70</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Open tickets and response against target</div>
                  <div style={{ marginTop: "6px", height: "6px", borderRadius: "6px", background: "#eef2f6" }}>
                    <div style={{ width: "70%", height: "100%", borderRadius: "6px", background: "#ff9800" }} />
                  </div>
                </div>
                <h3 style={{ margin: "16px 0 4px", fontSize: "11.5px", fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase", color: "#64748b" }}>Integrations</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #eef2f6", fontSize: "13px" }}>
                  <span style={{ color: "#0f172a", fontWeight: "500" }}>Pathao</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontWeight: "500" }}><span style={{ width: "8px", height: "8px", borderRadius: "9px", background: "#047857" }} />Healthy</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #eef2f6", fontSize: "13px" }}>
                  <span style={{ color: "#0f172a", fontWeight: "500" }}>Steadfast</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#c2410c", fontWeight: "500" }}><span style={{ width: "8px", height: "8px", borderRadius: "9px", background: "#c2410c" }} />Failing since 09:40</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #eef2f6", fontSize: "13px" }}>
                  <span style={{ color: "#0f172a", fontWeight: "500" }}>bKash</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#047857", fontWeight: "500" }}><span style={{ width: "8px", height: "8px", borderRadius: "9px", background: "#047857" }} />Healthy</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #eef2f6", fontSize: "13px" }}>
                  <span style={{ color: "#0f172a", fontWeight: "500" }}>Meta CAPI</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#a45100", fontWeight: "500" }}><span style={{ width: "8px", height: "8px", borderRadius: "9px", background: "#a45100" }} />Delayed events</span>
                </div>
                <div style={{ display: "grid", gap: "8px", marginTop: "18px" }}>
                  <a className="btn solid" href="#">Open in support desk</a>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>
                    <a className="btn ghost" href="#">Ask to view store</a>
                    <a className="btn ghost" href="#">Override plan</a>
                  </div>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "11.5px", lineHeight: "1.5", color: "#94a3b8" }}>Viewing the store needs the merchant's consent and is written to the audit log.</p>
              </aside>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)", gap: "16px" }}>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Speed against targets</h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Real users, Bangladeshi networks</span>
                </div>
                <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155", fontWeight: "500" }}>Storefront pages</span>
                      <span className="num" style={{ color: "#0f172a", fontWeight: "600" }}>1.9 s <span style={{ color: "#94a3b8", fontWeight: "400" }}>/ under 2.5 s</span></span>
                    </div>
                    <div style={{ position: "relative", marginTop: "6px", height: "8px", borderRadius: "8px", background: "#eef2f6" }}>
                      <div style={{ width: "76%", height: "100%", borderRadius: "8px", background: "#009cde" }} />
                      <span style={{ position: "absolute", right: "0", top: "-3px", width: "2px", height: "14px", background: "#0f172a" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155", fontWeight: "500" }}>API read p95</span>
                      <span className="num" style={{ color: "#0f172a", fontWeight: "600" }}>212 ms <span style={{ color: "#94a3b8", fontWeight: "400" }}>/ 300 ms</span></span>
                    </div>
                    <div style={{ position: "relative", marginTop: "6px", height: "8px", borderRadius: "8px", background: "#eef2f6" }}>
                      <div style={{ width: "71%", height: "100%", borderRadius: "8px", background: "#009cde" }} />
                      <span style={{ position: "absolute", right: "0", top: "-3px", width: "2px", height: "14px", background: "#0f172a" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155", fontWeight: "500" }}>API write p95</span>
                      <span className="num" style={{ color: "#0f172a", fontWeight: "600" }}>640 ms <span style={{ color: "#94a3b8", fontWeight: "400" }}>/ 800 ms</span></span>
                    </div>
                    <div style={{ position: "relative", marginTop: "6px", height: "8px", borderRadius: "8px", background: "#eef2f6" }}>
                      <div style={{ width: "80%", height: "100%", borderRadius: "8px", background: "#009cde" }} />
                      <span style={{ position: "absolute", right: "0", top: "-3px", width: "2px", height: "14px", background: "#0f172a" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ color: "#334155", fontWeight: "500" }}>Admin pages</span>
                      <span className="num" style={{ color: "#0f172a", fontWeight: "600" }}>1.4 s <span style={{ color: "#94a3b8", fontWeight: "400" }}>/ under 2 s</span></span>
                    </div>
                    <div style={{ position: "relative", marginTop: "6px", height: "8px", borderRadius: "8px", background: "#eef2f6" }}>
                      <div style={{ width: "70%", height: "100%", borderRadius: "8px", background: "#009cde" }} />
                      <span style={{ position: "absolute", right: "0", top: "-3px", width: "2px", height: "14px", background: "#0f172a" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Queue lag</h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Last 14 hours</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "76px", marginTop: "18px", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ flex: "1", height: "15px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "20px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "15px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "25px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "30px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "20px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "15px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "45px", borderRadius: "3px 3px 0 0", background: "#ff9800" }} />
                  <span style={{ flex: "1", height: "70px", borderRadius: "3px 3px 0 0", background: "#ff9800" }} />
                  <span style={{ flex: "1", height: "55px", borderRadius: "3px 3px 0 0", background: "#ff9800" }} />
                  <span style={{ flex: "1", height: "30px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "20px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "15px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                  <span style={{ flex: "1", height: "15px", borderRadius: "3px 3px 0 0", background: "#003087" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "12.5px", color: "#334155" }}>Peak at 09:00 from courier webhook retries. <b style={{ fontWeight: "600" }}>0</b> dead letters.</div>
              </div>
              <div className="card" style={{ padding: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Uptime, 30 days</h3>
                <div className="num" style={{ marginTop: "10px", fontSize: "34px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>99.96<span style={{ fontSize: "18px", color: "#64748b" }}>%</span></div>
                <div style={{ display: "flex", gap: "2px", marginTop: "12px" }}>
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#ff9800" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                  <span style={{ flex: "1", height: "22px", borderRadius: "2px", background: "#10b981" }} />
                </div>
                <div style={{ marginTop: "10px", fontSize: "12.5px", color: "#64748b" }}>Target 99.9 percent. One 26-minute degradation.</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
