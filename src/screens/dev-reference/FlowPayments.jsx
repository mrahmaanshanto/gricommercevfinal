'use client';
// Generated from design/templates/dev-reference/FlowPayments.dc.html by scripts/convert-design.mjs.
// Flow · Payments — Developer reference — Payment flow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569;font-size:14px}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}table{border-collapse:collapse;width:100%}`;

// ---- markup ----

export default class FlowPaymentsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlowPayments">
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
              <__Link href="/flow-payments" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#003087", color: "#fff" }}>Payments</__Link>
              <__Link href="/flow-onboarding" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Onboarding</__Link>
              <__Link href="/flow-staff" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Staff</__Link>
            </nav>
          </header>
          <main style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <section>
              <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", color: "#0f172a", letterSpacing: "-.02em" }}>Payment flow</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14.5px", lineHeight: "22px", color: "#475569", maxWidth: "860px" }}>How money reaches the merchant for each payment method, and how courier COD payouts are reconciled.</p>
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
              <div style={{ position: "relative", width: "1356px", height: "634px", margin: "0 auto" }}>
                <svg width="208" height="90" viewBox="0 0 208 90" aria-hidden="true" style={{ position: "absolute", left: "94px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 45 L200 45 L200 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah0)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "176px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah1)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "124px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 45 L170 45 L170 82" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah2)" />
                </svg>
                <svg width="208" height="240" viewBox="0 0 208 240" aria-hidden="true" style={{ position: "absolute", left: "64px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 205 L200 205 L200 232" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah3)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "368px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah4)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "560px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah5)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 45 L170 45 L170 82" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah6)" />
                </svg>
                <svg width="126" height="128" viewBox="0 0 126 128" aria-hidden="true" style={{ position: "absolute", left: "368px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L118 8 L118 120" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah7)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "368px", top: "354px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah8)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "316px", top: "392px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 45 L170 45 L170 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah9)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "560px", top: "354px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah10)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 45 L170 45 L170 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah11)" />
                </svg>
                <svg width="236" height="16" viewBox="0 0 236 16" aria-hidden="true" style={{ position: "absolute", left: "944px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L228 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah12)" />
                </svg>
                <span style={{ position: "absolute", left: "1062px", top: "201px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>amounts match</span>
                <svg width="148" height="90" viewBox="0 0 148 90" aria-hidden="true" style={{ position: "absolute", left: "892px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah13" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 30 L140 30 L140 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah13)" />
                </svg>
                <span style={{ position: "absolute", left: "966px", top: "261px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>mismatch</span>
                <svg width="148" height="90" viewBox="0 0 148 90" aria-hidden="true" style={{ position: "absolute", left: "1084px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah14" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 30 L140 30 L140 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah14)" />
                </svg>
                <span style={{ position: "absolute", left: "1158px", top: "261px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>resolved</span>
                <svg width="16" height="240" viewBox="0 0 16 240" aria-hidden="true" style={{ position: "absolute", left: "1276px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah15" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 232" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah15)" />
                </svg>
                <span style={{ position: "absolute", left: "1292px", top: "362px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>order returned</span>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "1136px", top: "504px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah16" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M36 8 L8 8" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah16)" />
                </svg>
                <div style={{ position: "absolute", left: "20px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Checkout</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.8)" }}>Customer picks a method</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Cash on delivery</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Default for most orders</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>bKash</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Merchant payment</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Nagad</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Merchant payment</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "474px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Card</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Visa, Mastercard, Amex</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Delivered</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Courier collects cash</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Paid online</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Gateway confirms</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Courier remittance</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Collected COD less charges</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Gateway settlement</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Paid to bank, T+1 to T+3</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Reconciliation</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Matched to delivered orders</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>Mismatch flagged</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>Short, missing or unknown</div>
                </div>
                <div style={{ position: "absolute", left: "1172px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#e7f8f1", border: "1.5px solid #10b981", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#065f46" }}>Settled</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#047857" }}>Amounts match</div>
                </div>
                <div style={{ position: "absolute", left: "1172px", top: "474px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>Refund requested</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>Cancelled or returned</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "474px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Refunded</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Original method or bKash</div>
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
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Checkout</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Customer selects a payment method</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetPayments (methods on/off)</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Cash on delivery, bKash, Nagad, Card</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Cash on delivery</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Customer choice, the default</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetPayments</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Delivered</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>bKash, Nagad</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Customer pays in the app; callback confirms</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetPayments</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Paid online</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Card</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Hosted card page with 3-D Secure</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetPayments</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Paid online</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Delivered</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier status update</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier remittance</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Paid online</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Gateway callback</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Gateway settlement, Refund requested</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Courier remittance</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Courier pays out collected COD, less charges</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetDelivery</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Reconciliation</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Gateway settlement</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Gateway payout to the bank</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetPayments</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Reconciliation</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Reconciliation</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Automatic on each payout file</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>SetDelivery</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Settled, Mismatch flagged</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Mismatch flagged</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Short amount, missing or unknown order</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Settled</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Settled</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Amounts match or the mismatch is resolved</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Refund requested</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Refund requested</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Order cancelled or returned after payment</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>OrderDetail</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Refunded</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Refunded</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff approves; sent to the original method</td>
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
                <__Link href="/set-payments" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>SetPayments.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Turn on COD, bKash, Nagad and card; payout accounts and fees.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/settings-console/SetPayments.dc.html</span>
                </__Link>
                <__Link href="/set-delivery" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>SetDelivery.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Courier accounts, COD charges and remittance matching rules.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/settings-console/SetDelivery.dc.html</span>
                </__Link>
                <__Link href="/order-detail" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OrderDetail.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Payment status, remittance match and refunds for one order.</span>
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
