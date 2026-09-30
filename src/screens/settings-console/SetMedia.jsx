'use client';
// Generated from design/templates/settings-console/SetMedia.dc.html by scripts/convert-design.mjs.
// SetMedia
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __SetChrome from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `html,body{height:100%}
.dc-h439:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h440:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h441:hover{background:#002a77 !important}`;

// ---- markup ----

export default class SetMediaScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetMedia">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="General" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="general" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Brand assets</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Eight images used across the storefront, invoices and receipts. Previews are set to <b style={{ fontWeight: "600", color: "#475569" }}>dark</b>, so you are checking each asset against the background it will actually sit on.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />6 of 8 set · 1 uploading · 1 rejected</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>General / Brand assets</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Manage logos</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Eight assets. Every tile states the format and size it needs, and previews against the theme you pick.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", height: "34px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "3px" }}>
                            <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "6px", padding: "0 10px", fontSize: "12px", color: "#64748b" }}><__Icon name="sun" strokeWidth="1.75" width="14" height="14" />Light</span>
                            <span style={{ display: "inline-flex", height: "26px", alignItems: "center", gap: "6px", borderRadius: "6px", background: "#1e293b", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#fff" }}><__Icon name="moon" strokeWidth="1.75" width="14" height="14" />Dark</span>
                          </span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="upload" strokeWidth="1.75" width="15" height="15" />Upload all</button>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: "600", color: "#0f172a" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "6px", background: "#003087", fontSize: "11px", color: "#fff" }}>S</span>Sellino</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Light theme logo</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "9999px", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "10px", fontWeight: "600", color: "#b36a00" }}>Low contrast here</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>SVG or PNG · 320×80 · max 500KB<br />sellino-logo-light.svg · 24KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: "600", color: "#66c4eb" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "6px", background: "#009cde", fontSize: "11px", color: "#fff" }}>S</span>Sellino</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Dark theme logo</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>SVG or PNG · 320×80 · max 500KB<br />sellino-logo-dark.svg · 25KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "#003087", fontSize: "15px", fontWeight: "600", color: "#fff" }}>S</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Favicon</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>PNG · 64×64 · max 100KB<br />favicon-64.png · 6KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#697a9b" }}>
                              <__Icon name="image-plus" strokeWidth="1.75" width="20" height="20" />
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10px" }}>drop image or browse</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Fallback image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>JPG or PNG · 600×600 · max 500KB<br />used when a product has no photo</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #003087", borderRadius: "7px", background: "rgba(0,48,135,.08)", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "600", color: "#003087", cursor: "pointer" }}>Add image</button>
                              <span style={{ fontSize: "11px", color: "#b36a00" }}>Not set</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80%" }}>
                              <span style={{ fontSize: "11px", color: "#c2c9d6" }}>Uploading… 68%</span>
                              <span style={{ display: "block", width: "100%", height: "5px", borderRadius: "9999px", background: "rgba(255,255,255,.16)", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "68%", height: "100%", borderRadius: "9999px", background: "#009cde" }} />
                              </span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Payment gateway image</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "9999px", background: "rgba(0,156,222,.16)", padding: "0 7px", fontSize: "10px", fontWeight: "600", color: "#0089c3" }}>Uploading</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>PNG · 640×120 · max 500KB<br />payments-strip.png · 184KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
                              <span style={{ fontSize: "11px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>125KB / 184KB</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "5px", background: "rgba(255,255,255,.1)", padding: "0 8px", fontSize: "10.5px", color: "#e7e9ef" }}>Pathao</span>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "5px", background: "rgba(255,255,255,.1)", padding: "0 8px", fontSize: "10.5px", color: "#e7e9ef" }}>Steadfast</span>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "5px", background: "rgba(255,255,255,.1)", padding: "0 8px", fontSize: "10.5px", color: "#e7e9ef" }}>RedX</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Delivery partner image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>PNG · 640×120 · max 500KB<br />couriers-strip.png · 156KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "9999px", background: "rgba(16,185,129,.2)", color: "#10b981" }}>
                              <__Icon name="badge-check" strokeWidth="1.75" width="20" height="20" />
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Verified badge image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>SVG or PNG · 96×96 · max 100KB<br />verified-badge.svg · 4KB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid #cbd5e1", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", overflow: "hidden" }}>
                          <div style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: "#192132" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#ff5724" }}>
                              <__Icon name="file-warning" strokeWidth="1.75" width="20" height="20" />
                              <span style={{ fontSize: "10.5px", color: "#ffb4a0" }}>File is 1.8MB — limit is 500KB</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Licences image</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "9999px", background: "rgba(255,87,36,.14)", padding: "0 7px", fontSize: "10px", fontWeight: "600", color: "#c2380f" }}>Too large</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "15px", color: "#64748b" }}>JPG or PNG · 800×600 · max 500KB<br />trade-licence-2026.jpg · 1.8MB</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button style={{ height: "30px", border: "1px solid rgba(255,87,36,.45)", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "600", color: "#c2380f", cursor: "pointer" }}>Try another file</button>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>or compress it</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "10px", background: "#f8fafc", padding: "13px 15px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "9px", background: "#fff", color: "#003087", boxShadow: "0 1px 3px 0 rgba(48,46,56,.1)" }}>
                          <__Icon name="upload-cloud" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>Drag files onto any tile, or drop them here</span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>SVG, PNG, JPG and WebP up to 500KB each. Images are optimised and served from the storage driver set in Platform → Storage.</span>
                        </span>
                        <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="folder-open" strokeWidth="1.75" width="15" height="15" />Browse files</button>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Where each asset appears</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>So you can tell which upload changes what.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 22px", padding: "16px 18px" }}>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Light / dark logo</b>
                          <span style={{ color: "#64748b" }}>Storefront header, admin sidebar, invoice header, POS receipt</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Favicon</b>
                          <span style={{ color: "#64748b" }}>Browser tab, bookmark, PWA icon</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Fallback image</b>
                          <span style={{ color: "#64748b" }}>Product cards and search results with no photo</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Payment gateway image</b>
                          <span style={{ color: "#64748b" }}>Checkout footer trust strip</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Delivery partner image</b>
                          <span style={{ color: "#64748b" }}>Shipping step and order tracking page</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Verified badge</b>
                          <span style={{ color: "#64748b" }}>Seller profile and product detail page</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>Licences image</b>
                          <span style={{ color: "#64748b" }}>Footer legal page and seller verification</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "12px", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "500", color: "#1e293b" }}>OG image (SEO tab)</b>
                          <span style={{ color: "#64748b" }}>Link previews in Messenger, WhatsApp and Facebook</span>
                        </span>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Manage logos<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>8</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Where used<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>8</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Tiles keep a fixed aspect so a wrong-size upload is obvious before you save.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,156,222,.16)", color: "#0089c3" }}>
  <__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />
</span>1 unsaved change</span>
                  <button className="dc-h439" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Review changes<__Icon name="chevron-up" strokeWidth="1.75" width="14" height="14" /></button>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S to save</span>
                  <button className="dc-h440" style={{ display: "inline-flex", alignItems: "center", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discard</button>
                  <button className="dc-h441" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 18px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".02em", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(0,48,135,.7)" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
