'use client';
// Generated from design/templates/dev-reference/FlowProducts.dc.html by scripts/convert-design.mjs.
// Flow · Products — Developer reference — Product flow.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:var(--font-sans);color:#475569;font-size:var(--text-sm)}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:var(--font-data)}table{border-collapse:collapse;width:100%}`;

// ---- markup ----

export default class FlowProductsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="FlowProducts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "2000px", overflow: "hidden", background: "#f8fafc" }}>
          <header style={{ position: "sticky", top: "0", zIndex: "90", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "14px 32px", background: "rgba(255,255,255,.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>G</span>
            <div style={{ marginRight: "auto" }}>
              <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#0f172a" }}>GridCommerce — page flows</div>
              <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>State machines behind each merchant area, with the screens that move them.</div>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)" }}>
              <__Link href="/dev/dev-reference" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#fff", border: "1px solid #e2e8f0", color: "#475569" }}>Developer reference</__Link>
              <__Link href="/dev/flow-orders" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Orders</__Link>
              <__Link href="/dev/flow-products" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff" }}>Products</__Link>
              <__Link href="/dev/flow-purchase" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Purchase</__Link>
              <__Link href="/dev/flow-payments" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Payments</__Link>
              <__Link href="/dev/flow-onboarding" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Onboarding</__Link>
              <__Link href="/dev/flow-staff" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Staff</__Link>
            </nav>
          </header>
          <main style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <section>
              <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "var(--tracking-tight)" }}>Product flow</h1>
              <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", color: "#475569", maxWidth: "860px" }}>How a product goes from draft to the storefront, and how variants, categories and stock hang off it.</p>
            </section>
            <section style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginBottom: "10px" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", marginRight: "auto" }}>Flow</span>
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
              <div style={{ position: "relative", width: "972px", height: "484px", margin: "0 auto" }}>
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
                <svg width="236" height="16" viewBox="0 0 236 16" aria-hidden="true" style={{ position: "absolute", left: "560px", top: "54px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 8 L228 8" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah2)" />
                </svg>
                <span style={{ position: "absolute", left: "678px", top: "51px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e7ebf2", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>archived by owner</span>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "286px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah3)" />
                </svg>
                <span style={{ position: "absolute", left: "302px", top: "137px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e7ebf2", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>changes asked</span>
                <svg width="126" height="128" viewBox="0 0 126 128" aria-hidden="true" style={{ position: "absolute", left: "94px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M118 120 L8 120 L8 8" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah4)" />
                </svg>
                <svg width="128" height="90" viewBox="0 0 128 90" aria-hidden="true" style={{ position: "absolute", left: "518px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#d97706" />
                    </marker>
                  </defs>
                  <path d="M8 8 L8 34 L120 34 L120 82" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah5)" />
                </svg>
                <span style={{ position: "absolute", left: "582px", top: "115px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e7ebf2", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>stock hits 0</span>
                <svg width="126" height="128" viewBox="0 0 126 128" aria-hidden="true" style={{ position: "absolute", left: "478px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#003087" />
                    </marker>
                  </defs>
                  <path d="M118 120 L8 120 L8 8" fill="none" stroke="#003087" strokeWidth="1.8" strokeLinejoin="round" markerEnd="url(#ah6)" />
                </svg>
                <span style={{ position: "absolute", left: "494px", top: "156px", transform: "translateY(-50%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e7ebf2", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>restocked</span>
                <svg width="208" height="90" viewBox="0 0 208 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <marker id="ah7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0 0 L10 5 L0 10 z" fill="#e11d48" />
                    </marker>
                  </defs>
                  <path d="M8 82 L8 34 L200 34 L200 8" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" markerEnd="url(#ah7)" />
                </svg>
                <span style={{ position: "absolute", left: "774px", top: "115px", transform: "translate(-50%, -100%)", maxWidth: "150px", padding: "2px 7px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e7ebf2", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569", textAlign: "center", whiteSpace: "normal" }}>discontinued</span>
                <svg width="16" height="240" viewBox="0 0 16 240" aria-hidden="true" style={{ position: "absolute", left: "54px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <path d="M8 232 L8 8" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" />
                </svg>
                <svg width="16" height="240" viewBox="0 0 16 240" aria-hidden="true" style={{ position: "absolute", left: "438px", top: "92px", overflow: "visible", pointerEvents: "none" }}>
                  <path d="M8 232 L8 8" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" />
                </svg>
                <svg width="16" height="90" viewBox="0 0 16 90" aria-hidden="true" style={{ position: "absolute", left: "670px", top: "242px", overflow: "visible", pointerEvents: "none" }}>
                  <path d="M8 82 L8 8" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 4" />
                </svg>
                <div style={{ position: "absolute", left: "20px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#0b1733", border: "1.5px solid #0b1733", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#fff" }}>Draft</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "rgba(203,216,238,.8)" }}>Created by staff</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#003087", border: "1.5px solid #003087", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#fff" }}>In review</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "rgba(203,216,238,.85)" }}>Checked before listing</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#e7f8f1", border: "1.5px solid #10b981", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#065f46" }}>Published</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#047857" }}>Visible on the storefront</div>
                </div>
                <div style={{ position: "absolute", left: "788px", top: "24px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#ffece6", border: "1.5px solid #f43f5e", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#8a2410" }}>Archived</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#b83210" }}>Hidden, history kept</div>
                </div>
                <div style={{ position: "absolute", left: "212px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#7a3b04" }}>Changes requested</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#a14f06" }}>Missing photos or price</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "174px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#fff4e0", border: "1.5px solid #f59e0b", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#7a3b04" }}>Out of stock</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#a14f06" }}>Every variant at 0</div>
                </div>
                <div style={{ position: "absolute", left: "20px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px dashed #cbd5e1", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Variants</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Size, colour, shade</div>
                </div>
                <div style={{ position: "absolute", left: "404px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px dashed #cbd5e1", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Categories</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>One primary, many tags</div>
                </div>
                <div style={{ position: "absolute", left: "596px", top: "324px", width: "164px", height: "76px", boxSizing: "border-box", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px dashed #cbd5e1", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Stock</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Per variant, per branch</div>
                </div>
              </div>
            </section>
            <section style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>States</div>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "var(--text-sm)", color: "#475569" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>State</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Triggered by</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Screen</th>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0", background: "#fbfcfe" }}>Next states</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Draft</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff saves a new product</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AddProduct, AddProductTabs</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>In review</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>In review</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Staff submits, or automatic when review is off</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AllProducts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Published, Changes requested</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Changes requested</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Reviewer</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AllProducts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Draft</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Published</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Reviewer or owner</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AllProducts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Out of stock, Archived</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Out of stock</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Stock of every variant reaches 0</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AllProducts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Published, Archived</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Archived</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Owner</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AllProducts</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Draft (restore)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Variants</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Options set on the product</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>AddProductTabs</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Stock per variant</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}>Categories</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>Tree maintained by owner</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>
                      <code style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>Categories</code>
                    </td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid #f1f4f8" }}>—</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", marginBottom: "12px" }}>Screens involved</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                <__Link href="/add-product" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>AddProduct.dc.html</code>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Quick single-page add for simple products.</span>
                  <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>templates/products/AddProduct.dc.html</span>
                </__Link>
                <__Link href="/add-product-tabs" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>AddProductTabs.dc.html</code>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Full editor: details, variants, pricing, stock, SEO.</span>
                  <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>templates/products/AddProductTabs.dc.html</span>
                </__Link>
                <__Link href="/all-products" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>AllProducts.dc.html</code>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Product list with state filters, bulk publish and archive.</span>
                  <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>templates/products/AllProducts.dc.html</span>
                </__Link>
                <__Link href="/catalog-setup" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>CatalogSetup.dc.html</code>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Attributes, variant options and units.</span>
                  <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>templates/products/CatalogSetup.dc.html</span>
                </__Link>
                <__Link href="/categories" style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", border: "1px solid transparent" }}>
                  <code style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Categories.dc.html</code>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Category tree and product assignment.</span>
                  <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>templates/products/Categories.dc.html</span>
                </__Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
}
