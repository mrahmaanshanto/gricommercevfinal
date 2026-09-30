'use client';
// Generated from design/templates/dev-reference/FlowOnboarding.dc.html by scripts/convert-design.mjs.
// Flow · Onboarding — Developer reference — Onboarding flow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569;font-size:14px}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}table{border-collapse:collapse;width:100%}`;

// ---- markup ----

export default class FlowOnboardingScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlowOnboarding">
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
              <__Link href="/flow-onboarding" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#003087", color: "#fff" }}>Onboarding</__Link>
              <__Link href="/flow-staff" style={{ padding: "6px 10px", borderRadius: "9999px", background: "#e9eef5", color: "#475569" }}>Staff</__Link>
            </nav>
          </header>
          <main style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <section>
              <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", color: "#0f172a", letterSpacing: "-.02em" }}>Onboarding flow</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14.5px", lineHeight: "22px", color: "#475569", maxWidth: "860px" }}>How a new merchant signs up with a phone number and reaches a live store, on the web and in the mobile app.</p>
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
                <svg width="236" height="16" viewBox="0 0 236 16" aria-hidden="true" style={{ position: "absolute", left: "944px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L228 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah4)" />
                </svg>
                <span style={{ position: "absolute", left: "1062px", top: "51px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>go live</span>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "176px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah5)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "368px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah6)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "560px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah7)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "752px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah8)" />
                </svg>
                <svg width="44" height="16" viewBox="0 0 44 16" aria-hidden="true" style={{ position: "absolute", left: "944px", top: "204px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 8 L36 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah9)" />
                </svg>
                <svg width="178" height="90" viewBox="0 0 178 90" aria-hidden="true" style={{ position: "absolute", left: "1054px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 45 L170 45 L170 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah10)" />
                </svg>
                <span style={{ position: "absolute", left: "1143px", top: "126px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>go live</span>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "478px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah11)" />
                </svg>
                <span style={{ position: "absolute", left: "494px", top: "287px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>code expired</span>
                <svg width="126" height="128" viewBox="0 0 126 128" aria-hidden="true" style={{ position: "absolute", left: "286px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M118 120 L8 120 L8 8" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah12)" />
                </svg>
                <span style={{ position: "absolute", left: "302px", top: "306px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>resend</span>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "1054px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah13" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah13)" />
                </svg>
                <span style={{ position: "absolute", left: "1070px", top: "287px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "6px", background: "#fff", border: "1px solid #e7ebf2", fontSize: "11px", lineHeight: "14px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>skip for now</span>
                <svg width="156" height="278" viewBox="0 0 156 278" aria-hidden="true" style={{ position: "absolute", left: "1136px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah14" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 270 L148 270 L148 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah14)" />
                </svg>
                <div style={{ position: "absolute", left: "20px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Sign up</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.8)" }}>Web or mobile browser</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Phone OTP</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>6-digit code by SMS</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Store details</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Name, category, district</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Channels</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Website, Facebook, POS</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>First product</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Can be skipped</div>
                </div>
                <div style={{ position: "absolute", left: "1172px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#e7f8f1", border: "1.5px solid #10b981", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#065f46" }}>Store live</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#047857" }}>Dashboard opens</div>
                </div>
                <div style={{ position: "absolute", left: "20px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>App welcome</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.8)" }}>Mobile app, first open</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Phone number</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>+880 format</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>OTP</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Auto-read on Android</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Store</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Name and category</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>Channels</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Where to sell</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#fff" }}>First product</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "rgba(203,216,238,.85)" }}>Photo from the camera</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#8a2410" }}>OTP expired</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#b83210" }}>After 5 minutes</div>
                </div>
                <div style={{ position: "absolute", left: "980px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "12px", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "13.5px", lineHeight: "17px", fontWeight: "600", color: "#7a3b04" }}>Skipped</div>
                  <div style={{ fontSize: "11.5px", lineHeight: "15px", color: "#a14f06" }}>Products added later</div>
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
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Sign up</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant enters a phone number on web or mobile browser</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantSignIn, MobileSignUp</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Phone OTP</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Phone OTP</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>SMS code entered</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantSignIn</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Store details</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Store details</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOnboarding</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Channels</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Channels</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOnboarding</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>First product</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>First product</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant (can skip)</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOnboarding</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Store live</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>App welcome</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>First open of the mobile app</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbWelcome</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Phone number</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Phone number</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbPhone</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>OTP</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>OTP</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>SMS code, auto-read on Android</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbOtp</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Store, OTP expired</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>OTP expired</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>5 minutes pass</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbOtp</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Phone number</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Store</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbStore</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Channels</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Channels</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbChannels</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>First product</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>First product</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbProduct</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Store live, Skipped</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Skipped</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Merchant taps Skip</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>app/OnbProduct</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Store live</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>Store live</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Setup complete</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "12.5px", color: "#003087" }}>MerchantOnboarding, app/OnbDone</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>Screens involved</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                <__Link href="/merchant-sign-in" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>MerchantSignIn.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Web sign in and sign up with phone OTP.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/merchant-signin/MerchantSignIn.dc.html</span>
                </__Link>
                <__Link href="/mobile-sign-up" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>MobileSignUp.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Sign up in a mobile browser.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/merchant-signin/MobileSignUp.dc.html</span>
                </__Link>
                <__Link href="/merchant-onboarding" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>MerchantOnboarding.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Web setup: store, channels, first product.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/merchant-onboarding/MerchantOnboarding.dc.html</span>
                </__Link>
                <__Link href="/onb-welcome" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbWelcome.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>App welcome screen.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbWelcome.dc.html</span>
                </__Link>
                <__Link href="/onb-phone" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbPhone.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Phone number entry.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbPhone.dc.html</span>
                </__Link>
                <__Link href="/onb-otp" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbOtp.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>OTP entry with resend.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbOtp.dc.html</span>
                </__Link>
                <__Link href="/onb-store" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbStore.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Store name and category.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbStore.dc.html</span>
                </__Link>
                <__Link href="/onb-channels" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbChannels.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Pick sales channels.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbChannels.dc.html</span>
                </__Link>
                <__Link href="/onb-product" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbProduct.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Add the first product.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbProduct.dc.html</span>
                </__Link>
                <__Link href="/onb-done" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "13px", fontWeight: "600", color: "#003087" }}>OnbDone.dc.html</code>
                  <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#475569" }}>Store is live.</span>
                  <span className="mono" style={{ fontSize: "11px", color: "#94a3b8" }}>templates/app/OnbDone.dc.html</span>
                </__Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
}
