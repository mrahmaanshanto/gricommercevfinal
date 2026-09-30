'use client';
// Generated from design/templates/core-backend/CoreUIData.dc.html by scripts/convert-design.mjs.
// Core backend UI · data presentation system
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
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.lift{transition:transform 220ms cubic-bezier(.23,1,.32,1),box-shadow 220ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){.lift:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(15,23,42,.05),0 16px 32px -14px rgba(15,23,42,.22)}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:background-color 180ms ease,color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,.row:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
.row{display:grid;align-items:center;border-radius:12px;transition:background-color 180ms ease}
.row:hover{background:#f4f7fb}
@media (prefers-reduced-motion: reduce){.lift,.btn,.row{transition:none}.lift:hover{transform:none}.btn:active{transform:none}}
`;

// ---- markup ----

export default class CoreUIDataScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CoreUIData">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "3400px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "56px 80px 64px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "-120px", top: "-160px", width: "520px", height: "520px", borderRadius: "9999px", border: "1px solid rgba(127,212,245,.18)" }} />
            <div style={{ position: "absolute", right: "-40px", top: "-80px", width: "360px", height: "360px", borderRadius: "9999px", border: "1px solid rgba(127,212,245,.14)" }} />
            <div style={{ position: "relative" }}>
              <nav aria-label="Plan boards" style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
                <__Link href="/core-ui-plan" className="btn onnavy">← UI design plan</__Link>
                <__Link href="/core-plan" className="btn onnavy">Build plan overview</__Link>
              </nav>
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".22em", textTransform: "uppercase", color: "#7fd4f5" }}>Core backend UI · Step 1 preview</p>
              <h1 style={{ margin: "14px 0 0", maxWidth: "960px", fontSize: "52px", lineHeight: "1.06", fontWeight: "700", letterSpacing: "-.03em", color: "#fff", textWrap: "balance" }}>Twelve chart types. Every number says what it means.</h1>
              <p style={{ margin: "18px 0 0", maxWidth: "800px", fontSize: "17px", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>These are the only charts the console and the merchant core screens use. Each has a job and none is decorative. Built once in step 1 as components, then reused in every step after it. Figures shown are illustrative.</p>
            </div>
          </header>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0070a0" }}>Chart kit</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>Twelve charts, each with one job</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "20px", marginTop: "28px" }}>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>KPI tile</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>01</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
                  <svg viewBox="0 0 360 150" width="100%" height="150" role="img" style={{ display: "block", overflow: "visible" }}>
                    <text x="0" y="14" fontSize="12" fill="#475569" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">Recurring revenue · September</text>
                    <text x="0" y="56" fontSize="36" fill="#0f172a" textAnchor="start" fontWeight="700" fontFamily="Poppins, system-ui, sans-serif">৳88,000</text>
                    <text x="0" y="80" fontSize="12" fill="#047857" textAnchor="start" fontWeight="600" fontFamily="Poppins, system-ui, sans-serif">▲ 6.2%</text>
                    <text x="52" y="80" fontSize="12" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">vs August · 44 paying stores</text>
                    <path d="M0.0,128.7 L15.7,133.1 L31.3,133.3 L47.0,137.0 L62.6,141.9 L78.3,142.0 L93.9,134.6 L109.6,128.9 L125.2,123.7 L140.9,126.4 L156.5,124.5 L172.2,126.4 L187.8,129.8 L203.5,134.2 L219.1,137.0 L234.8,129.5 L250.4,123.3 L266.1,117.6 L281.7,111.9 L297.4,115.0 L313.0,116.4 L328.7,113.2 L344.3,108.5 L360.0,102.0 L360,146 L0,146 Z" fill="#003087" opacity=".08" />
                    <path d="M0.0,128.7 L15.7,133.1 L31.3,133.3 L47.0,137.0 L62.6,141.9 L78.3,142.0 L93.9,134.6 L109.6,128.9 L125.2,123.7 L140.9,126.4 L156.5,124.5 L172.2,126.4 L187.8,129.8 L203.5,134.2 L219.1,137.0 L234.8,129.5 L250.4,123.3 L266.1,117.6 L281.7,111.9 L297.4,115.0 L313.0,116.4 L328.7,113.2 L344.3,108.5 L360.0,102.0" fill="none" stroke="#003087" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="360.0" cy="102.0" r="4" fill="#fff" stroke="#003087" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Command centre · Subscription dashboard · Queues</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Number first, change in words and an arrow, sparkline with no axes.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Revenue movement</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>02</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Subscription dashboard</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Gains rise in green, losses fall in warning and error colours, start and end stay navy.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Health score</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>03</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Merchant directory · Merchant 360</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · The band name and its shape always sit beside the ring.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Signal breakdown</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>04</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Health score · Endpoints against targets</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · One scale, one watch line; anything below it is called out in the error colour.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Funnel</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>05</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Trial funnel and cohorts · Command centre</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Stage-to-stage rate is printed, never left for the eye to judge by width.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Cohort retention</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>06</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Trial funnel and cohorts</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · One hue; darker means more retained, and every cell carries its number.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Usage meter</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>07</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Plan and usage · Limits and meters · Merchant 360</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · A tick at 80 percent; amber past it, error colour at the limit, both named in words.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Cost to serve</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>08</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Cost to serve · Merchant 360</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · The plan ceiling is drawn; only stores above it are coloured and ringed.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Uptime strip</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>09</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Platform health · Backup and restore · Status page</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · One bar per day; hovering gives the minutes lost and the incident.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Integration matrix</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>10</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Integration health · Domains · Support console</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Shape carries status: circle, triangle, diamond. Colour only confirms it.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Provisioning pipeline</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>11</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Provisioning monitor · Store being created · Connect domain</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Done, running and waiting differ by fill and line, not by colour alone.</p>
                </div>
              </figure>
              <figure className="card" style={{ margin: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 24px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <figcaption style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Activity calendar</figcaption>
                  <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>12</span>
                </div>
                <div style={{ padding: "4px 0 6px" }}>
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
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid #eef2f7" }}>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Used in</span> · Merchant 360 · Churn-risk queue</p>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}><span style={{ fontWeight: "600", color: "#0f172a" }}>Rule</span> · Twenty-two weeks at a glance; a fading tail is the churn signal staff act on.</p>
                </div>
              </figure>
            </div>
          </section>
          <section style={{ padding: "72px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0070a0" }}>Colour</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>Six series colours, one sequential scale, four status bands</h2>
            <p style={{ margin: "10px 0 0", maxWidth: "760px", fontSize: "15px", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Taken from the GridCommerce design system. Status is always shape plus word plus colour, so every chart still reads in greyscale and for colour-blind staff.</p>
            <div className="card" style={{ marginTop: "28px", padding: "28px", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "40px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#003087" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Navy</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#003087 · Primary series, totals</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#012169" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Deep navy</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#012169 · Headers, first funnel stage</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#009cde" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Sky</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#009cde · Current or live, fills only</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#0070a0" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Sky text</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#0070a0 · Sky when it is text</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#99d7f2" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Light sky</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#99d7f2 · Secondary series</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "56px", borderRadius: "10px", background: "#94a3b8" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Slate</span>
                    <span className="num" style={{ fontSize: "12px", color: "#475569" }}>#94a3b8 · Previous period, targets</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>Sequential scale · heatmaps and cohorts</div>
                  <div style={{ display: "flex", gap: "2px", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.1" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.2" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.3" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.4" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.5" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.6" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.7" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.8" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "0.9" }} />
                    <div style={{ flexGrow: "1", height: "28px", background: "#003087", opacity: "1.0" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "12px", color: "#475569" }}>
                    <span>Less</span>
                    <span>More</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Status bands</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: "1px solid #e6ebf2", borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="10" cy="10" r="7" fill="#10b981" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857" }}>Healthy</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Running as expected</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: "1px solid #e6ebf2", borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#b45309" }}>Watch</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Look this week</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: "1px solid #e6ebf2", borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#c2410c" }}>At risk</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Act today</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: "1px solid #e6ebf2", borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="10" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>No data</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>Too new to score</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "72px 80px 80px" }}>
            <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".18em", textTransform: "uppercase", color: "#0070a0" }}>Rules</p>
            <h2 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>How data is written, coloured and moved</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "20px", marginTop: "28px" }}>
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>Numbers</h3>
                <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Taka with thousands separators and tabular figures: ৳88,000.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Short forms (৳72k) only on chart labels; the full value sits in the tooltip.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Dates as 05 Aug 2026; times in 24-hour Dhaka time.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Under a day, relative time (4 min ago) with the exact time on hover.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Every chart states its period and when it last refreshed.</span>
                  </li>
                </ul>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>Status</h3>
                <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Every status carries a colour, a shape and a word.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Four bands only: Healthy, Watch, At risk, No data.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>The error colour is kept for money at risk and outages, so it never becomes wallpaper.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Text on colour meets 4.5 to 1; status text uses the darker text shades.</span>
                  </li>
                </ul>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>Motion</h3>
                <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Charts draw in once, on first load: 280 ms, ease-out cubic-bezier(.23,1,.32,1), 40 ms stagger between tiles.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>No counting-up numbers. Staff read these screens all day, and a number still moving reads as late.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Filter and range changes retarget in 200 ms from where the data is; nothing restarts from zero.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Tooltips open in 125 ms, then instantly while moving between points.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Nothing animates on keyboard actions or the Ctrl K search. Reduced motion keeps opacity only.</span>
                  </li>
                </ul>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>Density</h3>
                <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Console is dense: 8 px base, 40 px table rows, sticky headers, numbers right-aligned.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Controls stay 44 px high with a 3 px focus ring, even in dense tables.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>Merchant-side core screens use standard density and are checked at 360 px.</span>
                  </li>
                  <li style={{ display: "flex", gap: "10px", fontSize: "13px", lineHeight: "1.55", color: "#475569" }}>
                    <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#003087" }} />
                    <span>One primary action per screen; destructive actions name the verb and confirm.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
