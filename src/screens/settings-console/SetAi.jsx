'use client';
// Generated from design/templates/settings-console/SetAi.dc.html by scripts/convert-design.mjs.
// SetAi
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
.dc-h426:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h427:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h428:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h429:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h430:hover{background:#002a77 !important}`;

// ---- markup ----

export default class SetAiScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetAi">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="AI Auto-Reply" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="ai" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>AI Auto-Reply</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>One provider, one model, three channels and a hard spending cap. Prices shown are the provider’s list prices per million tokens, so the cost of a choice is visible before it is made.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Live on 2 channels</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>$42.18 spent in September</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Provider</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>The account the replies are billed to. Keys are stored encrypted and never shown again after saving.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Connected</span>
                        </span>
                      </div>
                      <div style={{ padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Enable AI auto-reply</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>When off, unanswered messages simply sit in the inbox — nothing is generated and nothing is billed.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", borderTop: "1px solid #f1f5f9", padding: "14px 0 0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Provider <span style={{ color: "#c2380f" }}>*</span></span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Anthropic is the default. “Custom” unlocks the OpenAI-compatible block below.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Anthropic</span>
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Anthropic API key <span style={{ color: "#c2380f" }}>*</span></span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Saved</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>console.anthropic.com → <b style={{ fontWeight: "600", color: "#475569" }}>API keys</b> → Create key. Needs the Messages scope only.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sk-ant-••••••••••••7f31</span>
                              <button className="dc-h426" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                              </button>
                              <button className="dc-h427" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                              </button>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "2px" }}>
                              <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Key valid · 240 ms · credit balance $312.40</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Model</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Pricing is per million tokens, as billed by the provider. A typical support reply is 1.4K in / 300 out.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>Sonnet 5 selected</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "1.5px solid #cbd5e1", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>Claude Haiku 4.5</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>Input <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$1</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$5</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "#f1f5f9" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>≈ <b style={{ fontWeight: "600", color: "#1e293b" }}>$0.003</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Fastest</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #003087", borderRadius: "10px", background: "rgba(0,48,135,.04)", padding: "13px 14px", boxShadow: "0 0 0 3px rgba(0,48,135,.08)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "5px solid #003087", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>Claude Sonnet 5</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>In use</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>Input <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$3</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$15</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "rgba(0,48,135,.14)" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>≈ <b style={{ fontWeight: "600", color: "#1e293b" }}>$0.009</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Balanced</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "13px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "1.5px solid #cbd5e1", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>Claude Opus 4.8</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>Input <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$5</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$25</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "#f1f5f9" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>≈ <b style={{ fontWeight: "600", color: "#1e293b" }}>$0.015</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Most capable</span>
                          </span>
                        </div>
                      </div>
                      <div style={{ margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "10px", background: "#f8fafc", padding: "14px 16px", opacity: ".72" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "9px", paddingBottom: "4px" }}>
                          <__Icon name="lock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                          <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569" }}>Custom provider</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Available when Provider = Custom</span>
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px 18px", paddingTop: "8px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>API key</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Any OpenAI-compatible endpoint — vLLM, Together, OpenRouter.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Enter key</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Base URL</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Full path including /v1. Must be reachable from the app server.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://api.together.xyz/v1</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Model name</span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Exactly as the provider spells it.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>meta-llama/Llama-4-70b</span>
                            </span>
                          </div>
                          <span style={{ display: "flex", gap: "12px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Price / 1M input</span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>For the budget calculation.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>$0.60</span>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Price / 1M output</span>
                              </span>
                              <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>For the budget calculation.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>$0.90</span>
                              </span>
                            </div>
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Channels</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Where the AI is allowed to answer. Each channel keeps its own transcript in the inbox.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>2 of 3 on</span>
                        </span>
                      </div>
                      <div style={{ padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Website chat widget</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>412 replies this month · median first response 4 seconds.</span>
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8", paddingRight: "12px" }}>412 replies</span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>WhatsApp Cloud API</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>806 replies this month. Requires the WhatsApp token in Social Integrations.</span>
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8", paddingRight: "12px" }}>806 replies</span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Facebook Messenger</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Page token is saved but the AI is not answering there yet.</span>
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8", paddingRight: "12px" }}>0 replies</span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s3" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>{"Budget & office hours"}</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>A hard cap protects you from a runaway loop. Hours decide when a human is expected instead.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <a href="#" style={{ fontSize: "12px", fontWeight: "500", color: "#003087", textDecoration: "none" }}>Open AI Usage</a>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Monthly budget cap <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Billed in USD by the provider; converted at ৳121.40 for your reports.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "180px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>$120.00</span>
                          </span>
                          <span style={{ display: "block", maxWidth: "400px", paddingTop: "4px" }}>
                            <span style={{ display: "flex", alignItems: "baseline", gap: "8px", paddingBottom: "6px" }}>
                              <b style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</b>
                              <span style={{ fontSize: "11.5px", color: "#64748b" }}>spent · 35% of cap · projected $58.40 by 30 Sep</span>
                            </span>
                            <span style={{ display: "block", position: "relative", height: "8px", borderRadius: "9999px", background: "#f1f5f9", overflow: "hidden" }}>
                              <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "9999px", background: "#003087" }} />
                              <span style={{ position: "absolute", left: "49%", top: "-3px", width: "1.5px", height: "14px", background: "#94a3b8" }} />
                            </span>
                            <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px", fontSize: "10.5px", color: "#94a3b8" }}>
                              <span>$0</span>
                              <span>projected</span>
                              <span>$120</span>
                            </span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>When the cap is reached <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Stopping is safer; notifying keeps replies flowing and can overrun.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Stop replying and alert admins</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>Alerts go to info@bugbuild.com and the admin inbox.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Office hours</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Inside these hours the AI drafts and a human sends. Outside them it replies directly.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "340px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>10:00 am</span>
                            </span>
                            <span style={{ flex: "none", fontSize: "12px", color: "#94a3b8" }}>to</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>08:00 pm</span>
                            </span>
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Asia/Dhaka · Friday is treated as a weekend for the support rota.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Escalation</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Hands the thread to a human when the customer asks twice or mentions a refund.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>After 2 unresolved turns</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Provider<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Model<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>6</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Channels<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                      <a href="#s3" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>{"Budget & hours"}<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>4</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Model and budget changes take effect on the next incoming message.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,156,222,.16)", color: "#0089c3" }}>
  <__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />
</span>1 unsaved change</span>
                  <button className="dc-h428" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Review changes<__Icon name="chevron-up" strokeWidth="1.75" width="14" height="14" /></button>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S to save</span>
                  <button className="dc-h429" style={{ display: "inline-flex", alignItems: "center", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discard</button>
                  <button className="dc-h430" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 18px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".02em", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(0,48,135,.7)" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
