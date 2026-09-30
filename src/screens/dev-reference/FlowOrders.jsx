'use client';
// Generated from design/templates/dev-reference/FlowOrders.dc.html by scripts/convert-design.mjs.
// Flow · Orders — Developer reference — Order flow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569;font-size:14px}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}table{border-collapse:collapse;width:100%}`;

// ---- markup ----

export default class FlowOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlowOrders">
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
              <__Link href="/flow-orders" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#003087", color: "#fff" }}>Orders</__Link>
              <__Link href="/flow-products" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Products</__Link>
              <__Link href="/flow-purchase" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Purchase</__Link>
              <__Link href="/flow-payments" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Payments</__Link>
              <__Link href="/flow-onboarding" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Onboarding</__Link>
              <__Link href="/flow-staff" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Staff</__Link>
            </nav>
          </header>
          <main style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <section>
              <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", color: "#0f172a", letterSpacing: "-.02em" }}>Order flow</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14.5px", lineHeight: "22px", color: "#475569", maxWidth: "860px" }}>How a COD order moves from checkout to cash in hand, including cancellations, returns and partial deliveries.</p>
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
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "1136px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah5)" />
                </svg>
                <svg width="168" height="90" viewBox="0 0 168 90" aria-hidden="true" style={{ position: "absolute", left: "94px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 45 L160 45 L160 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah6)" />
                </svg>
                <span style={{ position: "absolute", left: "178px", top: "126px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>fake or no answer</span>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "286px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah7)" />
                </svg>
                <svg width="168" height="90" viewBox="0 0 168 90" aria-hidden="true" style={{ position: "absolute", left: "326px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M160 8 L160 30 L8 30 L8 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah8)" />
                </svg>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "862px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah9)" />
                </svg>
                <span style={{ position: "absolute", left: "878px", top: "137px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>refused</span>
                <svg width="168" height="90" viewBox="0 0 168 90" aria-hidden="true" style={{ position: "absolute", left: "902px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 30 L160 30 L160 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah10)" />
                </svg>
                <span style={{ position: "absolute", left: "986px", top: "111px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>some items kept</span>
                <svg width="126" height="128" viewBox="0 0 126 128" aria-hidden="true" style={{ position: "absolute", left: "1136px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 120 L118 120 L118 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah11)" />
                </svg>
                <span style={{ position: "absolute", left: "1262px", top: "156px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>partial amount</span>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "944px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M36 8 L8 8" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah12)" />
                </svg>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "862px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah13" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah13)" />
                </svg>
                <span style={{ position: "absolute", left: "878px", top: "287px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>return received</span>
                <div style={{ position: "absolute", left: "20px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>New</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.8)" }}>Checkout, POS or manual</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Confirmed</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Call or SMS verified</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Packed</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Invoice and label printed</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Handed to courier</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Steadfast · Pathao · RedX</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>In transit</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Courier tracking synced</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Delivered</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Courier status update</div>
                </div>
                <div style={{ position: "absolute", left: "1172px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#e7f8f1", border: "1.5px solid #10b981", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#065f46" }}>COD collected</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#047857" }}>Remittance matched</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>Cancelled</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>Fake, no answer or changed mind</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>Returned</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>Refused or unreachable</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Partial delivery</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Customer keeps some items</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Restocked</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Parcel back at store</div>
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
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>New</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Customer checkout, POS or staff entry</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOrders</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Confirmed, Cancelled</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Confirmed</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff call or customer SMS reply</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Packed, Cancelled</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Packed</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Packer prints invoice and label</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Handed to courier, Cancelled</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Handed to courier</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier booking (Steadfast, Pathao or RedX)</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>In transit</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>In transit</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier status update</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOrders</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Delivered, Partial delivery, Returned</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Delivered</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier status or rider app</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>COD collected</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Partial delivery</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Rider marks the items kept</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>COD collected, Returned</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Returned</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier return status</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Restocked</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Restocked</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff scans the returned parcel</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>COD collected</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier remittance matched to the order</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Cancelled</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff, customer or fraud check</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>Screens involved</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                <__Link href="/merchant-orders" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>MerchantOrders.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Order list by state, bulk confirm and courier booking.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/merchant-orders/MerchantOrders.dc.html</span>
                </__Link>
                <__Link href="/order-detail" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OrderDetail.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>One order: confirm, pack, book courier, mark partial or returned.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/order-detail/OrderDetail.dc.html</span>
                </__Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
}
