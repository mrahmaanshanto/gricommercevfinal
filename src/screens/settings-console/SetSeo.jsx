'use client';
// Generated from design/templates/settings-console/SetSeo.dc.html by scripts/convert-design.mjs.
// SetSeo
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
.dc-h505:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h506:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h507:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h508:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h509:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h510:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h511:hover{background:#002a77 !important}`;

// ---- markup ----

export default class SetSeoScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetSeo">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome embedded /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar embedded crumb="SEO" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail embedded active="seo" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>SEO</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Titles, descriptions and the two analytics IDs — each with a live preview of what it produces and a character count against the limit that actually applies.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Indexed · 1,284 pages</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last saved 2 Sep 2026, 10:12 am</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Search appearance</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>What a search engine shows for your home page. The preview updates as you type.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Indexed</span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Crawled 6 Sep</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>SEO title <span style={{ color: "#c2380f" }}>*</span></span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Around 60 characters. Put the store name last — the first words carry the most weight.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"Sellino — Smart Commerce · Online & in-store in Bangladesh"}</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "90%", height: "100%", background: "#10b981" }} />
                              </span>
                              <span style={{ fontSize: "11px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>54 / 60 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Meta description</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>One or two sentences. Search engines may rewrite it, but a good one still lifts click-through.</span>
                            <div style={{ minHeight: "66px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "13px", lineHeight: "19px", color: "#1e293b" }}>Shop electronics, home and grocery from Sellino’s Feni, Gulshan and Chattogram stores. Cash on delivery, bKash and Nagad accepted nationwide.</div>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "99%", height: "100%", background: "#ff9800" }} />
                              </span>
                              <span style={{ fontSize: "11px", color: "#b36a00", fontVariantNumeric: "tabular-nums" }}>158 / 160 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Keywords</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Low value for ranking; still used by your own site search synonyms.</span>
                            <span style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "6px 8px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "6px", background: "#f1f5f9", padding: "0 8px", fontSize: "12px", color: "#334155" }}>online shop bangladesh<__Icon name="x" strokeWidth="1.75" width="12" height="12" style={{ color: "#94a3b8" }} /></span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "6px", background: "#f1f5f9", padding: "0 8px", fontSize: "12px", color: "#334155" }}>bkash payment<__Icon name="x" strokeWidth="1.75" width="12" height="12" style={{ color: "#94a3b8" }} /></span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "6px", background: "#f1f5f9", padding: "0 8px", fontSize: "12px", color: "#334155" }}>feni electronics<__Icon name="x" strokeWidth="1.75" width="12" height="12" style={{ color: "#94a3b8" }} /></span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "6px", background: "#f1f5f9", padding: "0 8px", fontSize: "12px", color: "#334155" }}>grocery delivery<__Icon name="x" strokeWidth="1.75" width="12" height="12" style={{ color: "#94a3b8" }} /></span>
                              <span style={{ display: "inline-flex", alignItems: "center", height: "24px", fontSize: "12px", color: "#94a3b8" }}>Add keyword…</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Author name</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Written into the article schema on blog and campaign pages.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "260px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sellino Editorial</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", minWidth: "0" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Search result preview</span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "14px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px", paddingBottom: "6px" }}>
                              <span style={{ display: "grid", placeItems: "center", width: "20px", height: "20px", borderRadius: "9999px", background: "#003087", fontSize: "9px", fontWeight: "600", color: "#fff" }}>S</span>
                              <span style={{ display: "block" }}>
                                <span style={{ display: "block", fontSize: "11px", lineHeight: "13px", color: "#334155" }}>Sellino</span>
                                <span style={{ display: "block", fontSize: "10.5px", lineHeight: "13px", color: "#64748b" }}>sellino.com.bd</span>
                              </span>
                            </span>
                            <span style={{ display: "block", fontSize: "15px", lineHeight: "20px", color: "#1a3fa8", paddingBottom: "3px" }}>{"Sellino — Smart Commerce · Online & in-store in Bangladesh"}</span>
                            <span style={{ display: "block", fontSize: "11.5px", lineHeight: "17px", color: "#475569" }}>Shop electronics, home and grocery from Sellino’s Feni, Gulshan and Chattogram stores. Cash on delivery, bKash and Nagad accepted…</span>
                          </div>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Titles longer than 60 characters are cut off on mobile. Yours fits with 6 characters spare.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "7px", borderRadius: "8px", background: "rgba(255,152,0,.1)", padding: "9px 11px", fontSize: "11.5px", lineHeight: "16px", color: "#7a4a00" }}><__Icon name="triangle-alert" strokeWidth="1.75" width="14" height="14" style={{ flex: "none", color: "#b36a00" }} />The description is 158 of 160 characters — two words from being truncated.</span>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Social card</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>How a link to your store looks when it is shared in Messenger, WhatsApp or Facebook.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="15" height="15" />Refresh Facebook cache</button>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>OG title</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Shorter than the SEO title — social cards clip around 40 characters.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Sellino — Smart Commerce</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "60%", height: "100%", background: "#10b981" }} />
                              </span>
                              <span style={{ fontSize: "11px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>24 / 40 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>OG description</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>One line. Written for a person scrolling, not for a crawler.</span>
                            <div style={{ minHeight: "48px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontSize: "13px", lineHeight: "19px", color: "#1e293b" }}>Order online, pay with bKash, collect in store or get it delivered nationwide.</div>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "69%", height: "100%", background: "#10b981" }} />
                              </span>
                              <span style={{ fontSize: "11px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>76 / 110 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>OG image</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Same media tile as Brand assets. 1200×630 keeps text readable in every app.</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "10px 12px" }}>
                              <span style={{ display: "grid", placeItems: "center", width: "96px", height: "50px", flex: "none", borderRadius: "7px", background: "repeating-linear-gradient(135deg,#f8fafc 0 6px,#f1f5f9 6px 12px)", color: "#94a3b8" }}>
                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "9px" }}>og-card.png</span>
                              </span>
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>og-card-september.png</span>
                                <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", color: "#64748b" }}>PNG · 1200×630 · 214KB</span>
                              </span>
                              <span style={{ display: "flex", gap: "6px" }}>
                                <button className="dc-h505" aria-label="Replace" title="Replace" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="replace" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button className="dc-h506" aria-label="Remove" title="Remove" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", minWidth: "0" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Shared link preview</span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
                            <span style={{ display: "grid", placeItems: "center", height: "158px", background: "repeating-linear-gradient(135deg,#f8fafc 0 8px,#f1f5f9 8px 16px)", color: "#94a3b8" }}>
                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px" }}>og image · 1200×630</span>
                            </span>
                            <span style={{ display: "block", borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "10px 12px" }}>
                              <span style={{ display: "block", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8" }}>sellino.com.bd</span>
                              <span style={{ display: "block", paddingTop: "2px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Sellino — Smart Commerce</span>
                              <span style={{ display: "block", fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Order online, pay with bKash, collect in store or get it delivered nationwide.</span>
                            </span>
                          </div>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Messenger and WhatsApp cache this card for up to 7 days. Refresh after changing the image.</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>{"Analytics & pixels"}</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>IDs only — no scripts are pasted here, so a wrong value cannot break the storefront.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Both verified</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Google Analytics ID</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Analytics → Admin → <b style={{ fontWeight: "600", color: "#475569" }}>Data streams</b> → your web stream. Starts with G-.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>G-4XQ7L2M9BD</span>
                            <button className="dc-h507" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Receiving events · last hit 3 minutes ago</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Facebook Pixel ID</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Events Manager → <b style={{ fontWeight: "600", color: "#475569" }}>Data sources</b> → your pixel. Numeric, 15–16 digits.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>418902337715640</span>
                            <button className="dc-h508" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Purchase and AddToCart firing</span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Search appearance<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>4</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Social card<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Analytics<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>2</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Previews are rendered from the fields on the left, not from the live site.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,156,222,.16)", color: "#0089c3" }}>
  <__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />
</span>2 unsaved changes</span>
                  <button className="dc-h509" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Review changes<__Icon name="chevron-up" strokeWidth="1.75" width="14" height="14" /></button>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S to save</span>
                  <button className="dc-h510" style={{ display: "inline-flex", alignItems: "center", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discard</button>
                  <button className="dc-h511" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 18px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".02em", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(0,48,135,.7)" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
