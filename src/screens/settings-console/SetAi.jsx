'use client';
// Generated from design/templates/settings-console/SetAi.dc.html by scripts/convert-design.mjs.
// SetAi
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetPick as __Pick, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "ai";
  fields = {
    provider: {l: "Provider", d: "Anthropic", req: true},
    anthropic_api_key: {l: "Anthropic API key", d: "sk-ant-••••••••••••7f31", req: true},
    model: {l: "Model", d: "Claude Sonnet 5"},
    custom_api_key: {l: "Custom provider API key", d: ""},
    custom_base_url: {l: "Custom provider base URL", d: "https://api.together.xyz/v1", k: "url"},
    custom_model_name: {l: "Model name", d: "meta-llama/Llama-4-70b"},
    custom_price_in: {l: "Price / 1M input", d: "$0.60"},
    custom_price_out: {l: "Price / 1M output", d: "$0.90"},
    monthly_budget_cap: {l: "Monthly budget cap", d: "$120.00", req: true, check: (x) => (/^\$?\d+(\.\d{1,2})?$/.test(x) ? "" : "Enter the cap as an amount in US dollars, like $120.00.")},
    when_the_cap_is_reached: {l: "When the cap is reached", d: "Stop replying and alert admins", req: true},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      custom: f.get("provider", "Anthropic") === "Custom",
      test: () => {
        const e = this.check("anthropic_api_key", f.get("anthropic_api_key", ""));
        if (e) { this.setState((st) => ({ errs: { ...st.errs, anthropic_api_key: e } }), () => f.focus("anthropic_api_key")); toast("Enter the API key before testing.", { tone: "error" }); return; }
        toast("Key is valid. The provider answered in 240 ms.");
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h426:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h427:hover{background:#e9eef5 !important;color:#1e293b !important}
`;

// ---- markup ----

export default class SetAiScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetAi">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="AI provider" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="ai" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header className="set-pagehead">
                      <span className="set-pagehead__text">
                        <h1 className="ix-head__title">AI provider</h1>
                        <__SetTips />
                        <span className="gc-pagehead__about" hidden>The AI provider, model and monthly budget. How the AI replies, on which channels, in which hours and when it hands over to a person is set in Grid AI › Behaviour.</span>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <__Link href="/ai-behaviour" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--primary)", textDecoration: "none" }}>Replies and channels: Grid AI › Behaviour</__Link>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>$42.18 spent in September</span>
                      </span>
                    </header>
                    <section id="s0" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Provider</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Connected</span>
                        </span>
                      </div>
                      <div style={{ padding: "6px 18px 18px" }}>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "8px 0 0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("provider")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Provider <span className="set-req" aria-hidden="true">*</span></label>
                            </span>
                            <span id={v.f.id("provider") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Anthropic is the default. “Custom” unlocks the OpenAI-compatible block below.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                              <__In f={v.f} n="provider" labelled desc opts={["Anthropic","Custom"]} />
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                            </span>
                            <__Err f={v.f} n="provider" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("anthropic_api_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Anthropic API key <span className="set-req" aria-hidden="true">*</span></label>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Saved</span>
                            </span>
                            <span id={v.f.id("anthropic_api_key") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>console.anthropic.com → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>API keys</b> → Create key. Needs the Messages scope only.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                              <__In f={v.f} n="anthropic_api_key" labelled desc />
                              <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h426" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                              </button>
                              <button type="button" onClick={v.f.copy("anthropic_api_key")} className="dc-h427" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                              </button>
                            </span>
                            <__Err f={v.f} n="anthropic_api_key" />
                            <span className="set-flow" style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "2px" }}>
                              <button type="button" onClick={v.test} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid var(--border-field)", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Key valid · 240 ms · credit balance $312.40</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section id="s1" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Model</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>{String(v.f.get("model", "Claude Sonnet 5")).replace("Claude ", "")} selected</span>
                        </span>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "16px" }}>
                        <__Pick f={v.f} n="model" val="Claude Haiku 4.5" style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Haiku 4.5</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>Input <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$1</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$5</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "#f1f5f9" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>≈ <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>$0.003</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Fastest</span>
                          </span>
                        </__Pick>
                        <__Pick f={v.f} n="model" val="Claude Sonnet 5" style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Sonnet 5</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>In use</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>Input <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$3</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$15</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "rgba(0,48,135,.14)" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>≈ <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>$0.009</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Balanced</span>
                          </span>
                        </__Pick>
                        <__Pick f={v.f} n="model" val="Claude Opus 4.8" style={{ display: "flex", flexDirection: "column", gap: "9px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Opus 4.8</span>
                          </span>
                          <span style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>Input <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$5</b> / 1M</span>
                            <span>Output <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$25</b> / 1M</span>
                          </span>
                          <span style={{ height: "1px", background: "#f1f5f9" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>≈ <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>$0.015</b> per reply</span>
                            <span style={{ marginLeft: "auto" }}>Most capable</span>
                          </span>
                        </__Pick>
                      </div>
                      <div style={{ margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "14px 16px", opacity: ".72" }}>
                        <span className="set-flow" style={{ display: "flex", alignItems: "center", gap: "9px", paddingBottom: "4px" }}>
                          <__Icon name="lock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Custom provider</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>{v.custom ? "Provider is Custom" : "Available when Provider is Custom"}</span>
                        </span>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px 18px", paddingTop: "8px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_api_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>API key</label>
                            </span>
                            <span id={v.f.id("custom_api_key") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Any OpenAI-compatible endpoint — vLLM, Together, OpenRouter.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                              <__In f={v.f} n="custom_api_key" labelled desc dis={!v.custom} placeholder="Enter key" />
                            </span>
                            <__Err f={v.f} n="custom_api_key" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_base_url")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Base URL</label>
                            </span>
                            <span id={v.f.id("custom_base_url") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Full path including /v1. Must be reachable from the app server.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                              <__In f={v.f} n="custom_base_url" labelled desc dis={!v.custom} />
                            </span>
                            <__Err f={v.f} n="custom_base_url" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_model_name")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Model name</label>
                            </span>
                            <span id={v.f.id("custom_model_name") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Exactly as the provider spells it.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                              <__In f={v.f} n="custom_model_name" labelled desc dis={!v.custom} />
                            </span>
                            <__Err f={v.f} n="custom_model_name" />
                          </div>
                          <span style={{ display: "flex", gap: "12px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("custom_price_in")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Price / 1M input</label>
                              </span>
                              <span id={v.f.id("custom_price_in") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>For the budget calculation.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                <__In f={v.f} n="custom_price_in" labelled desc dis={!v.custom} />
                              </span>
                              <__Err f={v.f} n="custom_price_in" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("custom_price_out")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Price / 1M output</label>
                              </span>
                              <span id={v.f.id("custom_price_out") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>For the budget calculation.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                <__In f={v.f} n="custom_price_out" labelled desc dis={!v.custom} />
                              </span>
                              <__Err f={v.f} n="custom_price_out" />
                            </div>
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s3" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Budget</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <__Link href="/set-usage" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Open AI Usage</__Link>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("monthly_budget_cap")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Monthly budget cap <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("monthly_budget_cap") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Billed in USD by the provider; converted at ৳121.40 for your reports.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", width: "180px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__In f={v.f} n="monthly_budget_cap" labelled desc />
                          </span>
                          <__Err f={v.f} n="monthly_budget_cap" />
                          <span style={{ display: "block", maxWidth: "400px", paddingTop: "4px" }}>
                            <span style={{ display: "flex", alignItems: "baseline", gap: "8px", paddingBottom: "6px" }}>
                              <b style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</b>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>spent · 35% of cap · projected $58.40 by 30 Sep</span>
                            </span>
                            <span style={{ display: "block", position: "relative", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                              <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "var(--radius-full)", background: "#003087" }} />
                              <span style={{ position: "absolute", left: "49%", top: "-3px", width: "1.5px", height: "14px", background: "#94a3b8" }} />
                            </span>
                            <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                              <span>$0</span>
                              <span>projected</span>
                              <span>$120</span>
                            </span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("when_the_cap_is_reached")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>When the cap is reached <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("when_the_cap_is_reached") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Stopping is safer; notifying keeps replies flowing and can overrun.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__In f={v.f} n="when_the_cap_is_reached" labelled desc opts={["Stop replying and alert admins","Keep replying and alert admins"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="when_the_cap_is_reached" />
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Alerts go to info@bugbuild.com and the admin inbox.</span>
                        </div>
                      </div>
                    </section>
                  </main>
                </div>
                <__SaveBar f={v.f} note="" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
