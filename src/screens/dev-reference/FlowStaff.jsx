'use client';
// Generated from design/templates/dev-reference/FlowStaff.dc.html by scripts/convert-design.mjs.
// Flow · Staff & HR — Developer reference — Staff and HR flow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569;font-size:14px}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}table{border-collapse:collapse;width:100%}`;

// ---- markup ----

export default class FlowStaffScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlowStaff">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "2000px", overflow: "hidden", background: "#f8fafc" }}>
          <header style={{ position: "sticky", top: "0", zIndex: "90", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "14px 32px", background: "rgba(255,255,255,.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "8px", background: "#003087", color: "#fff", fontSize: "15px", fontWeight: "600" }}>G</span>
            <div style={{ marginRight: "auto" }}>
              <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#0f172a" }}>GridCommerce — page flows</div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>State machines behind each merchant area, with the screens that move them.</div>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em" }}>
              <__Link href="/dev-reference" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#fff", border: "1px solid #e2e8f0", color: "#475569" }}>Developer reference</__Link>
              <__Link href="/flow-orders" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Orders</__Link>
              <__Link href="/flow-products" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Products</__Link>
              <__Link href="/flow-purchase" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Purchase</__Link>
              <__Link href="/flow-payments" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Payments</__Link>
              <__Link href="/flow-onboarding" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Onboarding</__Link>
              <__Link href="/flow-staff" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#003087", color: "#fff" }}>Staff</__Link>
            </nav>
          </header>
          <main style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <section>
              <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", color: "#0f172a", letterSpacing: "-.02em" }}>Staff and HR flow</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14.5px", lineHeight: "22px", color: "#475569", maxWidth: "860px" }}>How a staff member is added, scheduled, tracked and paid, with leave and advances on the side.</p>
            </section>
            <section style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "12.5px", color: "#64748b", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginRight: "auto" }}>Flow</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><svg width="28" height="8" aria-hidden="true">
  <path d="M0 4 L28 4" stroke="#003087" strokeWidth="2" />
</svg>Main path</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><svg width="28" height="8" aria-hidden="true">
  <path d="M0 4 L28 4" stroke="#d97706" strokeWidth="2" strokeDasharray="5 4" />
</svg>Branch</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><svg width="28" height="8" aria-hidden="true">
  <path d="M0 4 L28 4" stroke="#e11d48" strokeWidth="2" strokeDasharray="5 4" />
</svg>Failure or reversal</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><svg width="28" height="8" aria-hidden="true">
  <path d="M0 4 L28 4" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" />
</svg>Data link</span>
              </div>
              <div style={{ position: "relative", width: "1356px", height: "484px", margin: "0 auto" }}>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "176px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah0)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "368px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah1)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "560px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah2)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "752px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah3)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "944px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah4)" />
                </svg>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah5)" />
                </svg>
                <span style={{ position: "absolute", left: "686px", top: "137px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>applies for leave</span>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "752px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah6)" />
                </svg>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "832px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah7)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "1136px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M36 8 L8 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah8)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "892px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M170 82 L170 45 L8 45 L8 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah9)" />
                </svg>
                <span style={{ position: "absolute", left: "981px", top: "126px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>deducted monthly</span>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah10)" />
                </svg>
                <span style={{ position: "absolute", left: "686px", top: "287px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>rejected</span>
                <svg width="16" height="240" viewBox="0 0 16 240" aria-hidden="true" style={{ position: "absolute", left: "94px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <path d="M8 232 L8 8" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" />
                </svg>
                <div style={{ position: "absolute", left: "20px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Staff created</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.8)" }}>Profile, NID, phone</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Role assigned</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Permissions per module</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Shift assigned</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Branch and hours</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Attendance</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Daily check-in</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Payroll run</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Month end</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#e7f8f1", border: "1.5px solid #10b981", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#065f46" }}>Paid</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#047857" }}>Payslip sent</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Leave request</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Casual, sick, annual</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Leave approved</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Paid or unpaid</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Advance approved</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Loan or salary advance</div>
                </div>
                <div style={{ position: "absolute", left: "1172px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Advance requested</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Staff or manager</div>
                </div>
                <div style={{ position: "absolute", left: "20px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff", border: "1.5px dashed #cbd5e1", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#0f172a" }}>HR setup</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#64748b" }}>Holidays, pay rules, leave types</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>Leave rejected</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>Counted as absent</div>
                </div>
              </div>
            </section>
            <section style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>States</div>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "13.5px", color: "#475569" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#94a3b8", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>State</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#94a3b8", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Triggered by</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#94a3b8", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Screen</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#94a3b8", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Next states</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Staff created</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Owner or HR adds a staff member</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>StaffCreate, AllStaff</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Role assigned</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Role assigned</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Owner sets role and module permissions</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>StaffAccess</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Shift assigned</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Shift assigned</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Manager plans the roster</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Shifts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Attendance</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Attendance</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Check-in by app, POS PIN or device</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Attendance</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Payroll run, Leave request</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Leave request</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff or manager</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Leave</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Leave approved, Leave rejected</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Leave approved</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Manager</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Leave</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Payroll run</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Leave rejected</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Manager</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Leave</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Attendance (absent)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Advance requested</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff or manager</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>LoansAdvances</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Advance approved</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Advance approved</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Owner</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>LoansAdvances</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Payroll run (deducted)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Payroll run</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Month end, owner reviews</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Payroll</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Paid</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Paid</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Bank, bKash or cash</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>Payroll, StaffProfile</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>HR setup</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Owner configures</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>HrSetup</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Applies to all staff</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>Screens involved</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                <__Link href="/staff-create" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>StaffCreate.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Add a staff member.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-profile/StaffCreate.dc.html</span>
                </__Link>
                <__Link href="/all-staff" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>AllStaff.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Staff list by branch and role.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/AllStaff.dc.html</span>
                </__Link>
                <__Link href="/staff-access" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>StaffAccess.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Role and module permissions.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-profile/StaffAccess.dc.html</span>
                </__Link>
                <__Link href="/shifts" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>Shifts.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Roster and shift templates.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/Shifts.dc.html</span>
                </__Link>
                <__Link href="/attendance" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>Attendance.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Daily check-ins and late marks.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/Attendance.dc.html</span>
                </__Link>
                <__Link href="/leave" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>Leave.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Leave requests and balances.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/Leave.dc.html</span>
                </__Link>
                <__Link href="/payroll" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>Payroll.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Monthly payroll and payslips.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/Payroll.dc.html</span>
                </__Link>
                <__Link href="/loans-advances" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>LoansAdvances.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Loans and salary advances.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/LoansAdvances.dc.html</span>
                </__Link>
                <__Link href="/hr-setup" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>HrSetup.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Holidays, pay rules, leave types.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-hr/HrSetup.dc.html</span>
                </__Link>
                <__Link href="/staff-profile" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>StaffProfile.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>One staff member's record and history.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/staff-profile/StaffProfile.dc.html</span>
                </__Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
}
