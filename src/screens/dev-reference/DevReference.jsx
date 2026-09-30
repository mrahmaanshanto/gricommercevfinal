'use client';
// Generated from design/templates/dev-reference/DevReference.dc.html by scripts/convert-design.mjs.
// DevReference — One-page implementation spec — every token, type step, spacing unit, radius, shadow and component recipe with copyable variable names and class strings.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#f8fafc;font-family:var(--font-sans);color:#475569;font-size:var(--text-sm)}a{color:#003087;text-decoration:none}a:hover{color:#002a77}code,.mono{font-family:var(--font-data)}table{border-collapse:collapse;width:100%}
.dc-h1:hover{background:#002a77 !important}
.dc-h2:hover{background:rgba(0,48,135,.2) !important}
.dc-h3:hover{border-color:#94a3b8 !important}
.dc-h4:hover{background:rgba(0,48,135,.1) !important;color:#003087 !important}
.dc-f5:focus,.dc-f5:focus-visible,.dc-f5:focus-within{border-color:#003087 !important;outline:none !important;box-shadow:0 0 0 3px rgba(0,48,135,.5) !important}
.dc-h6:hover{border-color:#94a3b8 !important}
.dc-h7:hover{background:rgba(0,48,135,.2) !important}
.dc-h8:hover{background:rgba(203,213,225,.25) !important;color:#475569 !important}
.dc-h9:hover{background:rgba(203,213,225,.25) !important;color:#475569 !important}
.dc-h10:hover{border-color:#94a3b8 !important}
.dc-f11:focus,.dc-f11:focus-visible,.dc-f11:focus-within{border-color:#003087 !important;outline:none !important}
.dc-h12:hover{background:rgba(203,213,225,.25) !important;color:#475569 !important}
.dc-h13:hover{border-color:#94a3b8 !important}
.dc-h14:hover{border-color:#94a3b8 !important}`;

// ---- markup ----

export default class DevReferenceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="DevReference">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <header style={{ position: "sticky", top: "0", zIndex: "90", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "14px 32px", background: "rgba(255,255,255,.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>G</span>
          <div style={{ marginRight: "auto" }}>
            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#0f172a" }}>GridCommerce — developer reference</div>
            <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Every token, recipe and state in one page. Values are the source of truth; copy the variable, not the hex.</div>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)" }}>
            <a href="#colour" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Colour</a>
            <a href="#type" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Type</a>
            <a href="#layout" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Layout</a>
            <a href="#components" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Components</a>
            <a href="#tables" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Tables</a>
            <a href="#forms" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Forms</a>
            <a href="#states" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>States</a>
            <a href="#rules" style={{ padding: "6px 10px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569" }}>Rules</a>
          </nav>
        </header>
        <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 32px 64px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "32px" }}>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Entry point</div>
              <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>{"<link href=\"styles.css\">"}</div>
              <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>All tokens land on <code>:root</code>. Dark mode is <code>{"<html class=\"dark\">"}</code>.</p>
            </div>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Plain HTML</div>
              <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>{"class=\"gc-btn gc-btn--solid\""}</div>
              <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>Recipe classes live in <code>css/controls · surfaces · data</code>.</p>
            </div>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>React</div>
              <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b", wordBreak: "break-all" }}>{"const { Button } = window.GridCommerceDesignSystem_12be77"}</div>
              <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>30 components across core, forms, data, navigation, feedback, board.</p>
            </div>
          </section>
          <section id="colour">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Colour</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Roughly 90% of any screen is white, slate and navy. Colour marks the active nav item, the primary button, links, chart series and status.</p>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "20px", display: "grid", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Brand core</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px" }}>
                  <div>
                    <div style={{ height: "56px", borderRadius: "var(--radius-lg)", background: "#003087" }} />
                    <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b" }}>--primary</div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>#003087 · 11.85:1</div>
                  </div>
                  <div>
                    <div style={{ height: "56px", borderRadius: "var(--radius-lg)", background: "#012169" }} />
                    <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b" }}>--brand-navy-deep</div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>#012169</div>
                  </div>
                  <div>
                    <div style={{ height: "56px", borderRadius: "var(--radius-lg)", background: "#009cde" }} />
                    <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b" }}>--accent</div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>#009cde · graphics only</div>
                  </div>
                  <div>
                    <div style={{ height: "56px", borderRadius: "var(--radius-lg)", background: "#0089c3" }} />
                    <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b" }}>--accent-text</div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>#0089c3 · sky as text</div>
                  </div>
                  <div>
                    <div style={{ height: "56px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0" }} />
                    <div className="mono" style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "#1e293b" }}>--surface-card</div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>#ffffff</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Primary ramp <span className="mono" style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>--primary-50 → -900</span></div>
                <div style={{ display: "flex", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div style={{ flex: "1", height: "44px", background: "#f2f5f9" }} />
                  <div style={{ flex: "1", height: "44px", background: "#e0e6f1" }} />
                  <div style={{ flex: "1", height: "44px", background: "#bfcbe1" }} />
                  <div style={{ flex: "1", height: "44px", background: "#99accf" }} />
                  <div style={{ flex: "1", height: "44px", background: "#6683b7" }} />
                  <div style={{ flex: "1", height: "44px", background: "#2e559d" }} />
                  <div style={{ flex: "1", height: "44px", background: "#003087" }} />
                  <div style={{ flex: "1", height: "44px", background: "#002a77" }} />
                  <div style={{ flex: "1", height: "44px", background: "#002361" }} />
                  <div style={{ flex: "1", height: "44px", background: "#001a4a" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Accent ramp <span className="mono" style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>--accent-50 → -900</span></div>
                <div style={{ display: "flex", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div style={{ flex: "1", height: "44px", background: "#f2fafd" }} />
                  <div style={{ flex: "1", height: "44px", background: "#e0f3fb" }} />
                  <div style={{ flex: "1", height: "44px", background: "#bfe6f7" }} />
                  <div style={{ flex: "1", height: "44px", background: "#99d7f2" }} />
                  <div style={{ flex: "1", height: "44px", background: "#66c4eb" }} />
                  <div style={{ flex: "1", height: "44px", background: "#2eaee4" }} />
                  <div style={{ flex: "1", height: "44px", background: "#009cde" }} />
                  <div style={{ flex: "1", height: "44px", background: "#0089c3" }} />
                  <div style={{ flex: "1", height: "44px", background: "#0070a0" }} />
                  <div style={{ flex: "1", height: "44px", background: "#00567a" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Neutrals <span className="mono" style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>slate-50 → 900, plus the custom slate-150 #e9eef5</span></div>
                <div style={{ display: "flex", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "1", height: "44px", background: "#f8fafc" }} />
                  <div style={{ flex: "1", height: "44px", background: "#f1f5f9" }} />
                  <div style={{ flex: "1", height: "44px", background: "#e9eef5" }} />
                  <div style={{ flex: "1", height: "44px", background: "#e2e8f0" }} />
                  <div style={{ flex: "1", height: "44px", background: "#cbd5e1" }} />
                  <div style={{ flex: "1", height: "44px", background: "#94a3b8" }} />
                  <div style={{ flex: "1", height: "44px", background: "#64748b" }} />
                  <div style={{ flex: "1", height: "44px", background: "#475569" }} />
                  <div style={{ flex: "1", height: "44px", background: "#334155" }} />
                  <div style={{ flex: "1", height: "44px", background: "#1e293b" }} />
                  <div style={{ flex: "1", height: "44px", background: "#0f172a" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Dark navy ramp <span className="mono" style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>page 900 → panel 750 → card 700 → tile 600 → border 500</span></div>
                <div style={{ display: "flex", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div style={{ flex: "1", height: "44px", background: "#697a9b" }} />
                  <div style={{ flex: "1", height: "44px", background: "#465675" }} />
                  <div style={{ flex: "1", height: "44px", background: "#384766" }} />
                  <div style={{ flex: "1", height: "44px", background: "#313e59" }} />
                  <div style={{ flex: "1", height: "44px", background: "#26334d" }} />
                  <div style={{ flex: "1", height: "44px", background: "#222e45" }} />
                  <div style={{ flex: "1", height: "44px", background: "#202b40" }} />
                  <div style={{ flex: "1", height: "44px", background: "#192132" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Semantic + soft fill pairs</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "12px" }}>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.1)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Success</div>
                    <div className="mono" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--success #10b981<br />--fill-success-soft</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs)" }}>Paid · Delivered · In stock</div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.1)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />Warning</div>
                    <div className="mono" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--warning #ff9800<br />--fill-warning-soft</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs)" }}>Pending · Low stock</div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff5724" }} />Error</div>
                    <div className="mono" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--error #ff5724<br />--fill-error-soft</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs)" }}>Failed · Cancelled · Out of stock</div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(14,165,233,.1)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#0ea5e9" }} />Info</div>
                    <div className="mono" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--info #0ea5e9<br />--fill-info-soft</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs)" }}>Confirmed · Shipped · In transit</div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(240,0,185,.1)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#f000b9" }} />Promo</div>
                    <div className="mono" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--secondary #f000b9</div>
                    <div style={{ marginTop: "4px", fontSize: "var(--text-xs)" }}>Campaigns and refunds only</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginBottom: "8px" }}>Chart series — fixed order</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#003087" }} />--chart-1</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#009cde" }} />--chart-2</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#10b981" }} />--chart-3</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />--chart-4</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#f000b9" }} />--chart-5</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "6px 12px", fontSize: "var(--text-xs)" }} className="mono"><span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#697a9b" }} />--chart-6</span>
                </div>
              </div>
            </div>
          </section>
          <section id="type">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Type</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{"Poppins for Latin, Hind Siliguri for Bangla, system mono for IDs and SKUs. The two \"plus\" steps — 13px and 15px — carry most of the interface."}</p>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "8px 20px 16px", overflowX: "auto" }}>
              <table>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Token</th>
                    <th style={{ padding: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Size / line</th>
                    <th style={{ padding: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Weight · tracking</th>
                    <th style={{ padding: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Used for</th>
                    <th style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Sample</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-xs</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>12px / 1.333</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>500 · .025em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Table heads, eyebrows, meta</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>Order ID</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-xs-plus</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>13px / 18px</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>400–500 · .025em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Nav links, helper text, pagination, dropdown items</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>All orders</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-sm</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>14px / 1.429</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>400 · normal (buttons 500)</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Body default</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-sm)" }}>Mark as shipped</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-sm-plus</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>15px / 22px</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>600 · .025em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Card titles, Bangla body</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Order overview</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-base</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>16px / 1.5</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>400 · normal</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Long-form prose, marketing body</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-base)" }}>Commerce without limits.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-lg</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>18px / 1.556</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>600 · normal</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Section headings, modal titles</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>Fulfilment</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-xl</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>20px / 1.4</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>600–700 · normal</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Sub-page headings</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>Payouts</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-2xl</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>24px / 1.333</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>700 · −.025em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Page titles, KPI figures</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳12,45,430</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-3xl</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>30px / 1.2</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>700 · −.025em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Marketing sub-heads</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Grow together</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>--text-4xl</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>40px / 1.1</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>700 · −.028em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>Marketing display</td>
                    <td style={{ padding: "12px 0 12px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Build. Sell.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="mono" style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>--text-5xl</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs-plus)" }}>56px / 1.05</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)" }}>700 · −.028em</td>
                    <td style={{ padding: "12px", fontSize: "var(--text-xs-plus)" }}>Hero headline only</td>
                    <td style={{ padding: "12px 0 12px 12px" }}>
                      <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#003087" }}>Sell.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "12px", marginTop: "16px" }}>
                <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 14px" }}>
                  <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bangla — Hind Siliguri, +1 step</div>
                  <div style={{ fontFamily: "var(--font-bn)", fontSize: "var(--text-sm-plus)", color: "#1e293b", marginTop: "4px" }}>সব অর্ডার · পণ্য · ক্রেতা</div>
                </div>
                <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 14px" }}>
                  <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Mono — IDs, SKUs, API keys</div>
                  <div className="mono" style={{ fontSize: "var(--text-sm)", color: "#1e293b", marginTop: "4px" }}>#GC-24817 · SKU-4410-BLK</div>
                </div>
              </div>
            </div>
          </section>
          <section id="layout">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Spacing, radius, elevation, motion</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>4px base unit. 8px is the house radius. One soft shadow does 95% of the work.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Spacing scale</div>
                <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-1</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>4</span>
                    <span style={{ height: "12px", width: "4px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-2</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8</span>
                    <span style={{ height: "12px", width: "8px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-3</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>12</span>
                    <span style={{ height: "12px", width: "12px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-4</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>16</span>
                    <span style={{ height: "12px", width: "16px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-5</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>20</span>
                    <span style={{ height: "12px", width: "20px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-6</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>24</span>
                    <span style={{ height: "12px", width: "24px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-8</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>32</span>
                    <span style={{ height: "12px", width: "32px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ width: "74px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>--space-16</span>
                    <span className="mono" style={{ width: "34px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>64</span>
                    <span style={{ height: "12px", width: "64px", background: "#003087", borderRadius: "2px" }} />
                  </div>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "var(--text-xs-plus)" }}>Shell and rhythm are variables too: <code>--margin-x</code> 24 → 36 (md) → 64 (xl) · <code>--shell-inset</code> 12px · <code>--sidebar-panel-width</code> 280px · <code>--main-sidebar-width</code> 76px (collapsed rail) · <code>--header-height</code> 72px · <code>--card-padding</code> 24 / <code>--card-padding-lg</code> 28 · <code>--grid-gap</code> 20 / <code>--grid-gap-lg</code> 28 · <code>--section-gap</code> 40 · <code>--stack-gap</code> 24 · <code>--control-height</code> 44px.</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Radius</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#e9eef5", borderRadius: "var(--radius-sm)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-sm · 4</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#e9eef5", borderRadius: "var(--radius-md)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-md · 6</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#003087", borderRadius: "var(--radius-lg)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-lg · 8</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#e9eef5", borderRadius: "var(--radius-xl)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-xl · 12</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#e9eef5", borderRadius: "var(--radius-xl)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-2xl · 16</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "58px", height: "58px", background: "#e9eef5", borderRadius: "var(--radius-full)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>--radius-full</div>
                  </div>
                </div>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginTop: "20px" }}>Elevation</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "12px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "78px", height: "52px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 1px 2px 0 rgba(0,0,0,.05)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>--shadow-xs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "78px", height: "52px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>--shadow-soft<br />--shadow-card</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "78px", height: "52px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>--shadow-lg</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "78px", height: "52px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)" }} />
                    <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "6px" }}>--shadow-xl</div>
                  </div>
                </div>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", marginTop: "20px" }}>Motion</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}><code>--duration-base</code> 200ms with <code>--ease-out</code>{" "}<code>cubic-bezier(0,0,.2,1)</code> is the default; <code>--duration-fast</code> 150ms for hovers, <code>--duration-nav</code> 300ms with <code>--ease-in-out</code>{" "}<code>cubic-bezier(.4,0,.2,1)</code> for nav and sidebar. Shorthands: <code>--transition-colors</code>, <code>--transition-base</code>. Transition colours and opacity freely; transform only for modals and drawers. Modal fades and scales <code>.95 → 1</code>; dropdown fades and rises 4px. <code>prefers-reduced-motion: reduce</code> collapses all three durations to 1ms.</p>
              </div>
            </div>
          </section>
          <section id="components">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Components</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Each block shows the rendered element and the class string or import to reach for.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Button — product</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>36px tall · radius 8 · 14px/500 · .025em</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                  <button className="dc-h1" style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>Save changes</button>
                  <button className="dc-h2" style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>Soft</button>
                  <button className="dc-h3" style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>Outline</button>
                  <button className="dc-h4" style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>Ghost</button>
                  <button disabled style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", opacity: ".5", pointerEvents: "none" }}>Disabled</button>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-btn gc-btn--solid | --soft | --outlined | --bordered-soft | --flat | --neutral<br />sizes --xs 28 · --sm 32 · (default) 36 · --lg 44 · --block · --pill<br />tones --error · --success · --accent<br />{"<Button variant=\"solid\" tone=\"primary\" />"}</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Button — marketing</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>48–56px · full pill · sky + glow</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                  <button style={{ height: "48px", border: "none", borderRadius: "var(--radius-full)", background: "var(--accent-fill)", padding: "0 26px", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", boxShadow: "0 12px 26px -10px rgba(0,156,222,.75)" }}>Start free trial</button>
                  <button style={{ height: "48px", border: "1px solid #99d7f2", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 20px", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" }}><span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-xs)" }}>▶</span>Watch demo</button>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-btn gc-btn--accent gc-btn--pill gc-btn--lg (56px marketing: add height)<br />secondary = gc-btn--accent gc-btn--outlined gc-btn--pill<br />shadow: 0 12px 26px -10px rgba(0,156,222,.75)</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Badge & status"}</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>ORDER_STATUS_TONE binds word → tone</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#9a5b00" }}>Pending</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Processing</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(14,165,233,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0369a1" }}>Shipped</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>Delivered</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c2410c" }}>Cancelled</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "rgba(240,0,185,.1)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#a1007c" }}>Refunded</span>
                  <span style={{ borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Draft</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px", fontSize: "var(--text-xs-plus)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Online</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />Syncing</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#94a3b8" }} />Offline</span>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-badge gc-badge--success<br />{"<Badge tone={ORDER_STATUS_TONE.Delivered}>"}</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Form controls</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>border slate-300 → hover 400 → focus primary</div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label style={{ display: "grid", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Store name</span>
                    <input className="dc-f5" defaultValue="Rong Bazar" style={{ height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Shown on invoices and the storefront header.</span>
                  </label>
                  <label style={{ display: "grid", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payout method</span>
                    <select style={{ height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                      <option>bKash</option>
                      <option>Nagad</option>
                      <option>Bank transfer</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#c2410c" }}>Trade licence</span>
                    <input defaultValue="" placeholder="TL-000000" style={{ height: "38px", border: "1px solid #ff5724", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "#c2410c" }}>Enter the licence number printed on your certificate.</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", fontSize: "var(--text-sm)" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-xs)" }}>✓</span>Checkbox</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-full)", border: "2px solid #003087", display: "grid", placeItems: "center" }}>
  <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
</span>Radio</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "36px", height: "20px", borderRadius: "var(--radius-full)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 3px" }}>
  <span style={{ width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</span>Switch</label>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-field · gc-input · gc-select · gc-check<br />{"<FormField label helper error><Input /></FormField>"}</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Stat tile</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>number is the headline, chart is context</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "12px" }}>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "14px" }}>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Revenue</div>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>৳12,45,430</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#047857" }}>▲ 12%</div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "14px" }}>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Orders</div>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>1,284</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c2410c" }}>▼ 3%</div>
                  </div>
                </div>
                <div style={{ marginTop: "14px", display: "flex", alignItems: "flex-end", gap: "8px", height: "64px" }}>
                  <div style={{ flex: "1", height: "38%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                  <div style={{ flex: "1", height: "62%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                  <div style={{ flex: "1", height: "48%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                  <div style={{ flex: "1", height: "84%", background: "#009cde", borderRadius: "var(--radius-full)" }} />
                  <div style={{ flex: "1", height: "56%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                  <div style={{ flex: "1", height: "72%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>bars 6–10px, round caps, wide gaps · gridlines horizontal only</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Navigation</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>tabs · segmented · pagination</div>
                <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)" }}>
                  <span style={{ padding: "8px 0", color: "#003087", boxShadow: "inset 0 -2px 0 0 #003087" }}>All</span>
                  <span style={{ padding: "8px 0", color: "var(--text-muted)" }}>Unfulfilled</span>
                  <span style={{ padding: "8px 0", color: "var(--text-muted)" }}>Refunded</span>
                </div>
                <div style={{ display: "inline-flex", marginTop: "14px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>
                  <span style={{ borderRadius: "var(--radius-full)", background: "#fff", padding: "6px 14px", color: "#003087", boxShadow: "0 1px 2px 0 rgba(0,0,0,.05)" }}>Day</span>
                  <span style={{ padding: "6px 14px", color: "var(--text-muted)" }}>Week</span>
                  <span style={{ padding: "6px 14px", color: "var(--text-muted)" }}>Month</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px", fontSize: "var(--text-xs-plus)" }}>
                  <span style={{ color: "var(--text-muted)", marginRight: "8px" }}>1 – 10 of 240 entries</span>
                  <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontWeight: "var(--weight-medium)" }}>1</span>
                  <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "#475569" }}>2</span>
                  <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "#475569" }}>3</span>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-tabs · gc-segmented · gc-pagination</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Table</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>UPPERCASE heads · bottom separators only</div>
                <table>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "10px 8px 10px 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Order</th>
                      <th style={{ padding: "10px 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Status</th>
                      <th style={{ padding: "10px 0 10px 8px", textAlign: "right", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="mono" style={{ padding: "12px 8px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>#GC-24817</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>Delivered</span>
                      </td>
                      <td style={{ padding: "12px 0 12px 8px", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>৳2,340</td>
                    </tr>
                    <tr style={{ background: "#f1f5f9" }}>
                      <td className="mono" style={{ padding: "12px 8px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>#GC-24816</td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#9a5b00" }}>Pending</span>
                      </td>
                      <td style={{ padding: "12px 0 12px 8px", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>৳880</td>
                    </tr>
                    <tr>
                      <td className="mono" style={{ padding: "12px 8px 12px 0", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>#GC-24815</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(14,165,233,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0369a1" }}>Shipped</span>
                      </td>
                      <td style={{ padding: "12px 0 12px 8px", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>৳1,46,000</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>row hover = #f1f5f9 · sr-only caption · aria-sort on sortable heads</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Feedback</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>Alert doubles as toast · modal scrim slate-900/60</div>
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(14,165,233,.1)", padding: "12px 14px", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}><strong style={{ fontWeight: "var(--weight-medium)" }}>Payout scheduled.</strong> ৳84,200 lands in your bKash account on 10 Sep.</div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.1)", padding: "12px 14px", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}>
                    <strong style={{ fontWeight: "var(--weight-medium)" }}>2 products are below their low-stock threshold.</strong>
                  </div>
                  <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", padding: "12px 14px", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}><strong style={{ fontWeight: "var(--weight-medium)" }}>Payment failed.</strong> Retry or ask the customer for another method.</div>
                </div>
                <div style={{ marginTop: "14px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "14px" }}>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>Cancel order #GC-24817?</div>
                  <p style={{ margin: "6px 0 12px", fontSize: "var(--text-xs-plus)" }}>Stock is returned to the warehouse and the customer is notified. This cannot be undone.</p>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Keep order</button>
                    <button style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "var(--fill-danger)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff", cursor: "pointer" }}>Cancel order</button>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>gc-alert--info|warning|error · gc-modal (focus trap, Esc closes)</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Avatar, progress, empty state</div>
                <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "12px" }}>initials tile, never invented photography</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>SA</span>
                  <span style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.1)", color: "var(--accent-text)", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>RB</span>
                  <span style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>+4</span>
                </div>
                <div style={{ marginTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span>Fulfilment rate</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>78%</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#e9eef5", marginTop: "6px", overflow: "hidden" }}>
                    <div style={{ width: "78%", height: "100%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>
                <div style={{ marginTop: "12px", display: "flex", height: "8px", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ width: "46%", background: "#003087" }} />
                  <div style={{ width: "24%", background: "#009cde" }} />
                  <div style={{ width: "18%", background: "#10b981" }} />
                  <div style={{ width: "12%", background: "#e9eef5" }} />
                </div>
                <div style={{ marginTop: "16px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>No orders match these filters</div>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)" }}>Try widening the date range or clearing the status filter.</p>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>Avatar · AvatarGroup · ProgressBar · SegmentedBar · EmptyState</div>
              </div>
            </div>
          </section>
          <section id="tables">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Tables — how to build one</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Every list surface in the console is the same five-part stack. Build it in this order and any table — orders, products, payouts, customers, staff — comes out consistent.</p>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Anatomy</div>
              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ flex: "none", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>1</span>
                  <div style={{ fontSize: "var(--text-xs-plus)" }}><strong style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Card wrapper</strong> — <code>.gc-card</code> with <code>padding:0</code> and <code>overflow:hidden</code>. The table never floats on the page background.</div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ flex: "none", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                  <div style={{ fontSize: "var(--text-xs-plus)" }}><strong style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Toolbar</strong> — <code>.gc-table__toolbar</code>: title and count on the left, search pill, filter and export on the right. 16/20 padding.</div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ flex: "none", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>3</span>
                  <div style={{ fontSize: "var(--text-xs-plus)" }}><strong style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Scope row (optional)</strong> — <code>.gc-tabs</code> for status scopes, or a chip row for applied filters. Only one of the two.</div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ flex: "none", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>4</span>
                  <div style={{ fontSize: "var(--text-xs-plus)" }}><strong style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Table</strong> — <code>.gc-table gc-table--hoverable</code>, wrapped in a <code>overflow-x:auto</code> div. Heads are UPPERCASE 12px/600 on <code>--surface-table-head</code>; rows carry a bottom border only.</div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ flex: "none", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>5</span>
                  <div style={{ fontSize: "var(--text-xs-plus)" }}><strong style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Footer</strong> — <code>.gc-pagination</code>{": \"1 – 10 of 240 entries\" left, page circles right. Last row's border stays; the footer sits below it."}</div>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 20px" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>All orders</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>240 orders · 3 waiting to be confirmed</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <input aria-label="Search orders" type="search" placeholder="Search orders" style={{ height: "32px", width: "190px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                  </span>
                  <button className="dc-h6" style={{ height: "32px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Filter</button>
                  <button className="dc-h7" style={{ height: "32px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer" }}>Export</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0", padding: "0 20px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)" }}>
                <span style={{ padding: "10px 14px 10px 0", color: "#003087", boxShadow: "inset 0 -2px 0 0 #003087" }}>All</span>
                <span style={{ padding: "10px 14px", color: "var(--text-muted)" }}>Unfulfilled</span>
                <span style={{ padding: "10px 14px", color: "var(--text-muted)" }}>Unpaid</span>
                <span style={{ padding: "10px 14px", color: "var(--text-muted)" }}>Refunded</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "900px" }}>
                  <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Orders, sortable by date and total</caption>
                  <thead>
                    <tr style={{ background: "#e2e8f0" }}>
                      <th style={{ width: "44px", padding: "12px 0 12px 20px" }}>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                      </th>
                      <th style={{ textAlign: "left", padding: "12px 20px 12px 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap" }}>Order</th>
                      <th style={{ textAlign: "left", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap" }}>Product</th>
                      <th style={{ textAlign: "left", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap" }}>Customer</th>
                      <th aria-sort="descending" style={{ textAlign: "left", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#003087", whiteSpace: "nowrap", cursor: "pointer" }}>Placed ▼</th>
                      <th style={{ textAlign: "left", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap" }}>Status</th>
                      <th style={{ textAlign: "right", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap" }}>Total</th>
                      <th style={{ width: "80px", padding: "12px 20px 12px 0" }}>
                        <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "rgba(0,48,135,.1)" }}>
                      <td style={{ padding: "12px 0 12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", fontSize: "var(--text-2xs)" }}>✓</span>
                      </td>
                      <td style={{ padding: "12px 20px 12px 8px", borderBottom: "1px solid #e2e8f0" }}>
                        <a href="#" className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>#GC-24817</a>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>JS</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Jamdani saree</span>
                            <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>SKU-4410-BLK · ×2</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>NA</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Nusrat Ahmed</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Dhanmondi, Dhaka</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>06 Sep 2026</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>2:14 PM</span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>Delivered</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳2,340</td>
                      <td style={{ padding: "12px 20px 12px 0", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <button className="dc-h8" aria-label="Print invoice" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>⎙</button>
                          <button className="dc-h9" aria-label="More actions" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>⋯</button>
                        </span>
                      </td>
                    </tr>
                    <tr style={{ background: "#f1f5f9" }}>
                      <td style={{ padding: "12px 0 12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                      </td>
                      <td style={{ padding: "12px 20px 12px 8px", borderBottom: "1px solid #e2e8f0" }}>
                        <a href="#" className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>#GC-24816</a>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-xl)", background: "#f1f5f9", color: "var(--text-muted)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>CM</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Cotton kurta</span>
                            <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>SKU-1180-WHT · ×1</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.1)", color: "var(--accent-text)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RB</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Rafiq Bhuiyan</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Chattogram</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>06 Sep 2026</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>11:02 AM</span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#9a5b00" }}>Pending</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳880</td>
                      <td style={{ padding: "12px 20px 12px 0", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <button aria-label="Print invoice" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(203,213,225,.25)", color: "#475569", cursor: "pointer" }}>⎙</button>
                          <button aria-label="More actions" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>⋯</button>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "12px 0 12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                      </td>
                      <td style={{ padding: "12px 20px 12px 8px", borderBottom: "1px solid #e2e8f0" }}>
                        <a href="#" className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>#GC-24815</a>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-xl)", background: "#e0e6f1", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>HB</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Handloom bedsheet</span>
                            <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>SKU-9902-IND · ×4</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>SK</span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Shirin Khatun</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Sylhet</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>05 Sep 2026</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>6:40 PM</span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "rgba(14,165,233,.1)", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0369a1" }}>Shipped</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳1,46,000</td>
                      <td style={{ padding: "12px 20px 12px 0", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <button aria-label="Print invoice" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>⎙</button>
                          <button aria-label="More actions" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>⋯</button>
                        </span>
                      </td>
                    </tr>
                    <tr style={{ opacity: ".5" }}>
                      <td style={{ padding: "12px 0 12px 20px" }}>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1", background: "#fff" }} />
                      </td>
                      <td style={{ padding: "12px 20px 12px 8px" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>#GC-24814</span>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-xl)", background: "#f1f5f9" }} />
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Draft order</span>
                            <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>no items yet</span>
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>—</td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>05 Sep 2026</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>9:18 AM</span>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{ borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Draft</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳0</td>
                      <td style={{ padding: "12px 20px 12px 0" }} />
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 20px" }}>
                <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>1 – 10 of 240 entries</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs-plus)" }}>
                  <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>‹</span>
                  <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontWeight: "var(--weight-medium)" }}>1</span>
                  <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "#475569" }}>2</span>
                  <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "#475569" }}>3</span>
                  <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>›</span>
                </span>
              </div>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Rows above, top to bottom: selected (<code>primary/10</code>) · hovered (<code>slate-100</code>) · rest · disabled (<code>opacity .5</code>).</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "16px", marginTop: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "8px 20px 16px", overflowX: "auto" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", margin: "12px 0 4px" }}>Column recipes</div>
                <table>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Column</th>
                      <th style={{ padding: "10px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Align</th>
                      <th style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Recipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Select</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left, 44px</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>6px checkbox; header box = select page</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>ID</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>.gc-table__id — mono 13px/500 primary, links to detail</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Entity</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>32px tile (radius-xl) or avatar + name 14px + .gc-table__sub</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Date</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>06 Sep 2026 + time on .gc-table__sub line</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Status</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>Badge with ORDER_STATUS_TONE — never a bare dot</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Money / qty</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>right</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>.gc-table__money — 600, tabular-nums, ৳ no space</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Progress</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)", borderBottom: "1px solid #e2e8f0" }}>left, 140px</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>.gc-progress + % label above</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px 10px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Actions</td>
                      <td style={{ padding: "10px 12px", fontSize: "var(--text-xs-plus)" }}>right, 80px</td>
                      <td className="mono" style={{ padding: "10px 0 10px 12px", fontSize: "var(--text-xs)" }}>round icon buttons, aria-label each; overflow into ⋯ menu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Rules</div>
                <ul style={{ margin: "10px 0 0", paddingLeft: "18px", fontSize: "var(--text-xs-plus)", display: "grid", gap: "6px" }}>
                  <li>Text left, numbers right, status left, actions right. Never centre a data column.</li>
                  <li><code>td</code> is <code>white-space:nowrap</code> by default — wrap only the one description column if you must, and give it a <code>max-width</code>.</li>
                  <li>Density: default <code>12/20</code> padding; <code>.gc-table--compact</code> drops to <code>8/20</code> for POS and picker lists. Pick one per screen.</li>
                  <li>Row height is set by content, not a fixed height. Two-line cells make a 56px row — that is fine as long as every row has the same shape.</li>
                  <li>Six to eight columns maximum. Anything more goes into the detail page or an expandable row.</li>
                  <li>Horizontal scroll, never a squeezed layout: wrap in <code>overflow-x:auto</code> and set <code>min-width</code> on the table.</li>
                  <li>Sticky head for long lists: <code>{"thead th {position:sticky; top:var(--header-height)}"}</code> — the head keeps its <code>--surface-table-head</code> ground so rows pass under it.</li>
                  <li>Under 640px, don't shrink — swap to a stacked card list, one card per row, ID + status on the first line.</li>
                  <li>Sorting: only on columns the backend can sort. Active column turns primary and carries <code>aria-sort</code> plus ▲/▼; others stay slate with no arrow.</li>
                  <li>Selection: header box selects the page; a selected row is <code>primary/10</code>{"; the toolbar swaps to a bulk-action bar reading \"3 selected\"."}</li>
                  <li>Empty: keep the head, replace tbody with <code>EmptyState</code>{" in a full-width cell — instructive copy, no \"Oops\"."}</li>
                  <li>Loading: 5 skeleton rows of <code>slate-150</code> bars at the real column widths. No spinner over the table.</li>
                  <li>Every table gets an <code>sr-only</code>{" "}<code>{"<caption>"}</code>; sortable heads get <code>aria-sort</code>; row-click tables still need a real link in the ID cell for keyboard users.</li>
                </ul>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "16px", marginTop: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Plain HTML skeleton</div>
                <pre className="mono" style={{ margin: "10px 0 0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "12px 14px", fontSize: "var(--text-xs)", lineHeight: "1.6", color: "#334155", overflowX: "auto" }}>{"<div class=\"gc-card\" style=\"padding:0;overflow:hidden\">\n  <div class=\"gc-table__toolbar\">…title · search · filter…</div>\n  <div style=\"overflow-x:auto\">\n    <table class=\"gc-table gc-table--hoverable\">\n      <caption class=\"sr-only\">Orders</caption>  <!-- .sr-only is in tokens/base.css -->\n      <thead><tr>\n        <th>Order</th>\n        <th aria-sort=\"descending\">Placed</th>\n        <th style=\"text-align:right\">Total</th>\n      </tr></thead>\n      <tbody><tr>\n        <td><a class=\"gc-table__id\" href=\"…\">#GC-24817</a></td>\n        <td>06 Sep 2026<div class=\"gc-table__sub\">2:14 PM</div></td>\n        <td class=\"gc-table__money\">৳2,340</td>\n      </tr></tbody>\n    </table>\n  </div>\n  <div class=\"gc-pagination\">…</div>\n</div>"}</pre>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>React — DataTable</div>
                <pre className="mono" style={{ margin: "10px 0 0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "12px 14px", fontSize: "var(--text-xs)", lineHeight: "1.6", color: "#334155", overflowX: "auto" }}>{"const { DataTable, Badge, ORDER_STATUS_TONE } =\n  window.GridCommerceDesignSystem_12be77;\n\nconst columns = [\n  { key:'id', header:'Order', cellClass:'gc-table__id' },\n  { key:'placed', header:'Placed' },\n  { key:'status', header:'Status',\n    render: r => <Badge tone={ORDER_STATUS_TONE[r.status]}>\n                   {r.status}</Badge> },\n  { key:'total', header:'Total', align:'right',\n    cellClass:'gc-table__money' },\n];\n\n<DataTable columns={columns} rows={orders} rowKey=\"id\"\n  caption=\"Orders\" compact={false} hoverable\n  onRowClick={o => open(o.id)} />"}</pre>
                <div style={{ fontSize: "var(--text-xs-plus)", marginTop: "10px" }}>Column keys: <code>key</code> · <code>header</code> · <code>align</code> · <code>width</code> · <code>cellClass</code> · <code>render(row, i)</code>. Table props: <code>columns</code> · <code>rows</code> · <code>rowKey</code> · <code>caption</code> · <code>compact</code> · <code>hoverable</code> · <code>onRowClick</code> · <code>className</code>. Selection, sorting and pagination live in your screen state — <code>DataTable</code> renders, it does not fetch.</div>
              </div>
            </div>
          </section>
          <section id="forms">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Forms — every control</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>One field anatomy, one 38px control height, one 8px radius. Everything below is built from those three facts.</p>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Field anatomy</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px", marginTop: "12px", alignItems: "start" }}>
                <div style={{ maxWidth: "320px" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Store name <span style={{ color: "var(--text-danger)" }}>*</span></label>
                  {" "}
                  <input className="dc-h10 dc-f11" defaultValue="Rong Bazar" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                  <div style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Shown on invoices and the storefront header.</div>
                </div>
                <ol style={{ margin: "0", paddingLeft: "18px", fontSize: "var(--text-xs-plus)", display: "grid", gap: "6px" }}>
                  <li><code>.gc-label</code> — 13px/500 <code>--text-body</code>{", 4px below. Required marked with a red asterisk; optional fields say \"(optional)\" in the label, never in the placeholder."}</li>
                  <li><code>.gc-input</code> — <code>--control-height</code> 38px, <code>--radius-lg</code>, 1px <code>--border-field</code>, 14px text, transparent background so it works on any card.</li>
                  <li><code>.gc-help</code> — 12px <code>--text-muted</code>, 4px above. Same slot carries the error as <code>.gc-help--error</code>; never show both.</li>
                  <li>Vertical gap between fields is 16px (<code>--space-4</code>); between field groups 24px.</li>
                </ol>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Text inputs</div>
                <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Text</span>
                    <input defaultValue="Rong Bazar" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Email</span>
                    <span style={{ position: "relative", display: "block" }}>
                      <span style={{ position: "absolute", left: "0", top: "0", width: "36px", height: "100%", display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>@</span>
                      <input type="email" defaultValue="hello@rongbazar.com.bd" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px 0 36px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Password</span>
                    <span style={{ position: "relative", display: "block" }}>
                      <input type="password" defaultValue="············" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 44px 0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                      <button className="dc-h12" aria-label="Show password" style={{ position: "absolute", right: "4px", top: "4px", width: "30px", height: "30px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>◎</button>
                    </span>
                    <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>At least 8 characters with one number.</span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Phone</span>
                    <span style={{ display: "flex" }}>
                      <span style={{ display: "grid", placeItems: "center", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", background: "#f1f5f9", padding: "0 12px", fontSize: "var(--text-sm)", color: "#475569" }}>+880</span>
                      <input defaultValue="1712 345 678" style={{ flex: "1", minWidth: "0", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Amount</span>
                    <span style={{ display: "flex" }}>
                      <span style={{ display: "grid", placeItems: "center", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", background: "#f1f5f9", padding: "0 12px", fontSize: "var(--text-sm)", color: "#475569" }}>৳</span>
                      <input defaultValue="1,46,000" style={{ flex: "1", minWidth: "0", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "0", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums", textAlign: "right" }} />
                      <span style={{ display: "grid", placeItems: "center", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderLeft: "none", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0", background: "#f1f5f9", padding: "0 12px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>BDT</span>
                    </span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Number stepper</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <button style={{ width: "32px", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", fontSize: "var(--text-base)", cursor: "pointer" }}>−</button>
                      <input defaultValue="4" style={{ width: "64px", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", textAlign: "center", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                      <button style={{ width: "32px", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", fontSize: "var(--text-base)", cursor: "pointer" }}>+</button>
                    </span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Search pill <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" }}>— toolbar only, 32px</span></span>
                    <span style={{ position: "relative", display: "block" }}>
                      <span style={{ position: "absolute", left: "0", top: "0", width: "36px", height: "100%", display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}>⌕</span>
                      <input aria-label="Search orders, products, customers" type="search" placeholder="Search orders, products, customers" style={{ width: "100%", height: "32px", boxSizing: "border-box", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                    </span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Textarea</span>
                    <textarea rows="3" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "8px 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", lineHeight: "1.5", color: "#1e293b", resize: "vertical" }} defaultValue={"Handloom cotton, dyed in Narayanganj. Ships in 2 days."} />
                    <span style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      <span>Shown on the product page.</span>
                      <span className="mono">64 / 280</span>
                    </span>
                  </label>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>.gc-input · .gc-input--with-icon · textarea.gc-input · .gc-search<br />prefix/suffix = flex row, first/last child keeps the radius</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Choice controls</div>
                <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Select</span>
                    <select style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                      <option>bKash</option>
                      <option>Nagad</option>
                      <option>Bank transfer</option>
                      <option>Cash on delivery</option>
                    </select>
                  </label>
                  <div>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Multi-select / tags</span>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", minHeight: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "5px 8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "3px 8px", fontSize: "var(--text-xs-plus)", color: "#334155" }}>Saree<span role="button" tabIndex={0} style={{ color: "var(--text-muted)", cursor: "pointer" }}>×</span></span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "3px 8px", fontSize: "var(--text-xs-plus)", color: "#334155" }}>Cotton<span role="button" tabIndex={0} style={{ color: "var(--text-muted)", cursor: "pointer" }}>×</span></span>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Add tag…</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Combobox — open</span>
                    <div style={{ border: "1px solid #003087", borderRadius: "var(--radius-lg)", height: "38px", boxSizing: "border-box", padding: "0 12px", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", color: "#1e293b" }}>Dha</div>
                    <div style={{ marginTop: "4px", border: "1px solid #e9eef5", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)", padding: "4px", fontSize: "var(--text-xs-plus)" }}>
                      <div style={{ padding: "8px 10px", borderRadius: "var(--radius-md)", background: "rgba(0,48,135,.1)", color: "#003087" }}>Dhaka</div>
                      <div style={{ padding: "8px 10px", borderRadius: "var(--radius-md)", color: "#475569" }}>Dhamrai</div>
                      <div style={{ padding: "8px 10px", borderRadius: "var(--radius-md)", color: "#475569" }}>Dhanmondi</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", fontSize: "var(--text-sm)", color: "#334155" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", border: "1px solid #94a3b8", background: "#fff" }} />Unchecked</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-xs)" }}>✓</span>Checked</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-xs)" }}>−</span>Mixed</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", opacity: ".5" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", border: "1px solid #94a3b8", background: "#f1f5f9" }} />Disabled</label>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", fontSize: "var(--text-sm)", color: "#334155" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-full)", border: "1px solid #94a3b8", background: "#fff" }} />Radio</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-full)", border: "2px solid #003087", display: "grid", placeItems: "center" }}>
  <span style={{ width: "9px", height: "9px", borderRadius: "var(--radius-full)", background: "#003087" }} />
</span>Selected</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><span style={{ width: "40px", height: "20px", borderRadius: "var(--radius-full)", background: "#cbd5e1", display: "flex", alignItems: "center", padding: "0 2px" }}>
  <span style={{ width: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</span>Off</label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><span style={{ width: "40px", height: "20px", borderRadius: "var(--radius-full)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 2px" }}>
  <span style={{ width: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</span>On</label>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Radio cards — one visible choice per row</span>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "12px" }}>
                        <span style={{ marginTop: "2px", width: "18px", height: "18px", flex: "none", borderRadius: "var(--radius-full)", border: "2px solid #003087", display: "grid", placeItems: "center" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                        </span>
                        <span>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>bKash</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Payout within 24 hours · 1.5% fee</span>
                        </span>
                      </label>
                      <label className="dc-h13" style={{ display: "flex", gap: "10px", alignItems: "flex-start", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "12px" }}>
                        <span style={{ marginTop: "2px", width: "18px", height: "18px", flex: "none", borderRadius: "var(--radius-full)", border: "1px solid #94a3b8" }} />
                        <span>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Bank transfer</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Settles in 2–3 working days · no fee</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Segmented control</span>
                    <span style={{ display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>
                      <span style={{ borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "6px 14px", color: "#003087" }}>All</span>
                      <span style={{ padding: "6px 14px", color: "var(--text-muted)" }}>Active</span>
                      <span style={{ padding: "6px 14px", color: "var(--text-muted)" }}>Archived</span>
                    </span>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Range</span>
                    <span style={{ display: "block", position: "relative", height: "6px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                      <span style={{ position: "absolute", left: "0", top: "0", height: "6px", width: "62%", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <span style={{ position: "absolute", left: "62%", top: "-6px", width: "18px", height: "18px", marginLeft: "-9px", borderRadius: "var(--radius-full)", background: "#fff", boxShadow: "0 1px 3px 0 rgba(0,0,0,.2),0 0 0 2px #003087" }} />
                    </span>
                    <span style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      <span>৳0</span>
                      <span className="mono" style={{ color: "#1e293b" }}>৳6,200</span>
                      <span>৳10,000</span>
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>.gc-select · .gc-check · .gc-check--radio · .gc-switch (+ __knob) · .gc-seg</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Date, time & files"}</div>
                <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Date</span>
                      <input type="date" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Time</span>
                      <input type="time" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </label>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Date range — one button, not two fields</span>
                    <button className="dc-h14" style={{ display: "inline-flex", height: "38px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>31 Aug – 6 Sep 2026</button>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Dropzone</span>
                    <div style={{ border: "2px dashed #cbd5e1", borderRadius: "var(--radius-lg)", padding: "24px", textAlign: "center" }}>
                      <div style={{ fontSize: "var(--text-sm)", color: "#475569" }}>Drop images here or <span style={{ color: "#003087", fontWeight: "var(--weight-medium)" }}>browse</span></div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>PNG or JPG, up to 5 MB each. First image becomes the thumbnail.</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                      <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-xl)", background: "#e0f3fb" }} />
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>saree-front.jpg</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1.2 MB · uploaded</span>
                      </span>
                      <button aria-label="Remove saree-front.jpg" style={{ width: "28px", height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>×</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                      <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-xl)", background: "#e9eef5" }} />
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>saree-detail.jpg</span>
                        <span style={{ display: "block", height: "6px", borderRadius: "var(--radius-full)", background: "#e9eef5", marginTop: "6px", overflow: "hidden" }}>
                          <span style={{ display: "block", width: "64%", height: "100%", background: "#003087", borderRadius: "var(--radius-full)" }} />
                        </span>
                      </span>
                      <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>64%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", padding: "10px 12px" }}>
                      <span style={{ width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-xl)", background: "rgba(255,87,36,.15)" }} />
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>catalogue.pdf</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "#c2410c" }}>Too large — 5 MB maximum.</span>
                      </span>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c2410c", cursor: "pointer" }}>Retry</button>
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>One-time code</span>
                    <span style={{ display: "flex", gap: "8px" }}>
                      <span style={{ width: "40px", height: "46px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", display: "grid", placeItems: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>4</span>
                      <span style={{ width: "40px", height: "46px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "grid", placeItems: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>1</span>
                      <span style={{ width: "40px", height: "46px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "grid", placeItems: "center", fontSize: "var(--text-lg)", color: "#cbd5e1" }}>–</span>
                      <span style={{ width: "40px", height: "46px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "grid", placeItems: "center", fontSize: "var(--text-lg)", color: "#cbd5e1" }}>–</span>
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>.gc-dropzone · dates are DD MMM YYYY, Asia/Dhaka · never two inputs for one range</div>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Field states</div>
                <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Rest</span>
                    <input placeholder="Placeholder is an example, never the label" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Hover</span>
                    <input defaultValue="Border steps to slate-400" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #94a3b8", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Focus — border only, no ring on fields</span>
                    <input defaultValue="Typing…" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #003087", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Error</span>
                    <input defaultValue="TL-12" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #ff5724", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "#c2410c" }}>Licence numbers are 9 digits — check the certificate.</span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Success</span>
                    <input defaultValue="TL-448120973" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #10b981", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "#047857" }}>Verified with RJSC.</span>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Read-only</span>
                    <input defaultValue="GC-MERCHANT-4471" readOnly className="mono" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 12px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} />
                  </label>
                  <label style={{ display: "block", opacity: ".5" }}>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Disabled</span>
                    <input defaultValue="Set by your plan" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b", pointerEvents: "none" }} />
                  </label>
                  <div>
                    <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Loading / saving</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px" }}>
                      <span style={{ flex: "1", height: "10px", borderRadius: "var(--radius-full)", background: "#e9eef5" }} />
                      <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>saving…</span>
                    </div>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: "12px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "10px 12px", fontSize: "var(--text-xs)", color: "#334155" }}>.gc-input--error + .gc-help--error · readonly = slate-50 ground, slate-200 border<br />disabled = opacity .5 + pointer-events:none</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "16px", marginTop: "16px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Form layout</div>
                <p style={{ margin: "8px 0 12px", fontSize: "var(--text-xs-plus)" }}>Sections are cards: a 15px title, a 13px muted description, then the fields. Two columns from 768px up; anything that reads as one thought (address, description) spans both.</p>
                <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "16px" }}>
                  <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Store details</div>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginBottom: "12px" }}>Shown to customers at checkout.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px" }}>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Legal name</span>
                      <input defaultValue="Rong Bazar Ltd" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>District</span>
                      <select style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                        <option>Dhaka</option>
                        <option>Chattogram</option>
                      </select>
                    </label>
                    <label style={{ display: "block", gridColumn: "1/-1" }}>
                      <span style={{ display: "block", marginBottom: "4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Street address</span>
                      <input defaultValue="House 42, Road 7, Dhanmondi" style={{ width: "100%", height: "38px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Unsaved changes</span>
                  <span style={{ display: "flex", gap: "8px" }}>
                    <button style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Discard</button>
                    <button style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff", cursor: "pointer" }}>Save changes</button>
                  </span>
                </div>
                <ul style={{ margin: "12px 0 0", paddingLeft: "18px", fontSize: "var(--text-xs-plus)", display: "grid", gap: "6px" }}>
                  <li>Actions sit bottom-right: primary last, cancel as outline or ghost. On long pages the bar goes sticky at the bottom of the card.</li>
                  <li>Destructive actions live in their own section at the end, with an error-solid button.</li>
                  <li>Validate on blur, re-validate on change, never on every keystroke. Summarise at the top only when the form is longer than a screen.</li>
                  <li>{"Errors name the fix — \"Licence numbers are 9 digits\" — never \"Invalid input\"."}</li>
                  <li>Fields keep their width honest: 38px height, full-width in a column; short values (postcode, quantity) may cap at 120–160px.</li>
                  <li>Never disable submit to signal invalidity — let it submit and show the errors.</li>
                  <li>Bangla labels run ~25% longer: no fixed-width labels, no truncation, bump helper text to 13px.</li>
                  <li>Every input has a real <code>{"<label for>"}</code>; errors are wired with <code>aria-describedby</code> and <code>aria-invalid</code>; groups of radios sit in a <code>{"<fieldset>"}</code> with a <code>{"<legend>"}</code>.</li>
                </ul>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Markup & React"}</div>
                <pre className="mono" style={{ margin: "10px 0 0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "12px 14px", fontSize: "var(--text-xs)", lineHeight: "1.6", color: "#334155", overflowX: "auto" }}>{"<label class=\"gc-field\">\n  <span class=\"gc-label\">Store name</span>\n  <span class=\"gc-field__wrap\">\n    <span class=\"gc-field__icon\">@</span>\n    <input class=\"gc-input gc-input--with-icon\"\n           aria-describedby=\"store-help\">\n  </span>\n  <span class=\"gc-help\" id=\"store-help\">Shown on invoices.</span>\n</label>\n\n<!-- error -->\n<input class=\"gc-input gc-input--error\" aria-invalid=\"true\">\n<span class=\"gc-help gc-help--error\">9 digits.</span>"}</pre>
                <pre className="mono" style={{ margin: "10px 0 0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "12px 14px", fontSize: "var(--text-xs)", lineHeight: "1.6", color: "#334155", overflowX: "auto" }}>{"const { FormField, Input, Textarea, Select, Checkbox,\n        Radio, Switch, SearchInput } =\n  window.GridCommerceDesignSystem_12be77;\n\n<FormField label=\"Trade licence\" required\n           help=\"Printed on your certificate.\"\n           error={errors.licence}>\n  <Input value={v} onChange={set} placeholder=\"TL-000000\" />\n</FormField>\n\n<Switch checked={cod} onChange={setCod}\n        label=\"Accept cash on delivery\" />"}</pre>
                <div style={{ fontSize: "var(--text-xs-plus)", marginTop: "10px" }}><code>FormField</code> owns label, required mark, helper and error — controls stay dumb. Wrap the whole form in a plain <code>{"<form onSubmit>"}</code> so Enter submits.</div>
              </div>
            </div>
          </section>
          <section id="states">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Interaction states</h2>
            <p style={{ margin: "0 0 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Nothing scales, nothing lifts, opacity never signals hover.</p>
            <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "8px 20px 16px", overflowX: "auto" }}>
              <table>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>State</th>
                    <th style={{ padding: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Solid</th>
                    <th style={{ padding: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Soft / ghost</th>
                    <th style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", borderBottom: "1px solid #e2e8f0" }}>Field</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Rest</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>--primary</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>primary/10 · transparent</td>
                    <td className="mono" style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>border slate-300</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Hover</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>--primary-focus #002a77</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>primary/20 · gains tint</td>
                    <td className="mono" style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>border slate-400</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Press</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>primary-focus/90</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>primary/25</td>
                    <td className="mono" style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>Focus</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>3px ring rgba(0,48,135,.5)</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>same ring</td>
                    <td className="mono" style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)", borderBottom: "1px solid #e2e8f0" }}>border → primary, no ring</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Disabled</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)" }}>opacity .5 + pointer-events none</td>
                    <td className="mono" style={{ padding: "12px", fontSize: "var(--text-xs)" }}>same</td>
                    <td className="mono" style={{ padding: "12px 0 12px 12px", fontSize: "var(--text-xs)" }}>same</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section id="rules">
            <h2 style={{ margin: "0 0 4px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Rules to build against</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginTop: "12px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Shell & z-ladder"}</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>One 280px sidebar card at <code>z 100</code>, collapsing to a 76px rail — no separate icon rail · 12px desk inset between it and the main card · 72px sticky header <code>z 90</code>, blurred once scrolled · dropdown 120 · drawer 150 · scrim 200 · modal 210 · toast 250.</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Dark mode</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>Swap <code>primary → accent</code> (navy is 1.36:1 on navy-900). Step surfaces by colour, not shadow. Soft fills go /10 → /15. Toggle with <code>{"class=\"dark\""}</code> on <code>{"<html>"}</code>, persisted to localStorage.</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Accessibility</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>Body text ≥ 4.5:1 · visible 3px focus ring everywhere · hit targets ≥ 36×36 · status never colour-only · icon buttons always carry <code>aria-label</code> · modals trap focus and return it on close.</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Localisation</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>Every string bilingual. Bangla runs ~25% longer — bump body 14 → 15 and never pin a nav item or button to a fixed width. <code>৳</code> prefix with no space, lakh/crore grouping locally. Dates <code>11 Sep 2026</code>, time on a second muted line, Asia/Dhaka.</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Copy</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)" }}>{"Sentence case everywhere; UPPERCASE only for table heads, the marketing eyebrow and the tagline. Status words are fixed vocabulary — never synonymise. No \"Oops\", no exclamation marks, no emoji."}</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", padding: "16px 20px" }}>
                <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#0f172a" }}>Anti-patterns</div>
                <p style={{ margin: "8px 0 0", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}>Gradients on product surfaces · a card with both border and shadow in light mode · stacked elevations · saturated status blocks instead of /10 fills · sky <code>#009cde</code> as small text · icon-only buttons without a label · more than six chart series · hand-drawn illustration.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }
}
