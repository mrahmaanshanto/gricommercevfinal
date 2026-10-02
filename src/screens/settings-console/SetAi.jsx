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
    enable_ai_auto_reply: {l: "Enable AI auto-reply", d: true},
    website_chat_widget: {l: "Website chat widget", d: true},
    whatsapp_cloud_api: {l: "WhatsApp Cloud API", d: true},
    facebook_messenger: {l: "Facebook Messenger", d: false},
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
    office_hours: {l: "Office hours", d: "10:00", k: "time"},
    office_hours_to: {l: "Office hours (to)", d: "20:00", k: "time", check: (x, f) => (x <= f.get("office_hours", "") ? "Office hours must end after they start." : "")},
    escalation: {l: "Escalation", d: "After 2 unresolved turns"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      custom: f.get("provider", "Anthropic") === "Custom",
      channels: ["website_chat_widget", "whatsapp_cloud_api", "facebook_messenger"].filter((n) => f.get(n, false)).length,
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
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="AI Auto-Reply" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="ai" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>AI Auto-Reply</h1>
                        <__SetTips />
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>{v.channels === 0 ? "Not live on any channel" : "Live on " + v.channels + (v.channels === 1 ? " channel" : " channels")}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>$42.18 spent in September</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Provider</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Connected</span>
                        </span>
                      </div>
                      <div style={{ padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Enable AI auto-reply</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>When off, unanswered messages simply sit in the inbox — nothing is generated and nothing is billed.</span>
                          </span>
                          <__Sw f={v.f} n="enable_ai_auto_reply" />
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", borderTop: "1px solid #f1f5f9", padding: "14px 0 0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("provider")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Provider <span className="set-req" aria-hidden="true">*</span></label>
                            </span>
                            <span id={v.f.id("provider") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Anthropic is the default. “Custom” unlocks the OpenAI-compatible block below.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                              <__In f={v.f} n="provider" labelled desc opts={["Anthropic","Custom"]} />
                              <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                            </span>
                            <__Err f={v.f} n="provider" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("anthropic_api_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Anthropic API key <span className="set-req" aria-hidden="true">*</span></label>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Saved</span>
                            </span>
                            <span id={v.f.id("anthropic_api_key") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>console.anthropic.com → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>API keys</b> → Create key. Needs the Messages scope only.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
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
                              <button type="button" onClick={v.test} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Key valid · 240 ms · credit balance $312.40</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Model</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>{String(v.f.get("model", "Claude Sonnet 5")).replace("Claude ", "")} selected</span>
                        </span>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "18px" }}>
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
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>In use</span>
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>{v.custom ? "Provider is Custom" : "Available when Provider is Custom"}</span>
                        </span>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px 18px", paddingTop: "8px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_api_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>API key</label>
                            </span>
                            <span id={v.f.id("custom_api_key") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Any OpenAI-compatible endpoint — vLLM, Together, OpenRouter.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                              <__In f={v.f} n="custom_api_key" labelled desc dis={!v.custom} placeholder="Enter key" />
                            </span>
                            <__Err f={v.f} n="custom_api_key" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_base_url")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Base URL</label>
                            </span>
                            <span id={v.f.id("custom_base_url") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Full path including /v1. Must be reachable from the app server.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                              <__In f={v.f} n="custom_base_url" labelled desc dis={!v.custom} />
                            </span>
                            <__Err f={v.f} n="custom_base_url" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("custom_model_name")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Model name</label>
                            </span>
                            <span id={v.f.id("custom_model_name") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Exactly as the provider spells it.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
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
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                <__In f={v.f} n="custom_price_in" labelled desc dis={!v.custom} />
                              </span>
                              <__Err f={v.f} n="custom_price_in" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("custom_price_out")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Price / 1M output</label>
                              </span>
                              <span id={v.f.id("custom_price_out") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>For the budget calculation.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                <__In f={v.f} n="custom_price_out" labelled desc dis={!v.custom} />
                              </span>
                              <__Err f={v.f} n="custom_price_out" />
                            </div>
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Channels</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>{v.channels} of 3 on</span>
                        </span>
                      </div>
                      <div style={{ padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Website chat widget</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>412 replies this month · median first response 4 seconds.</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", paddingRight: "12px" }}>412 replies</span>
                          <__Sw f={v.f} n="website_chat_widget" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>WhatsApp Cloud API</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>806 replies this month. Requires the WhatsApp token in Social Integrations.</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", paddingRight: "12px" }}>806 replies</span>
                          <__Sw f={v.f} n="whatsapp_cloud_api" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Facebook Messenger</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Page token is saved but the AI is not answering there yet.</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", paddingRight: "12px" }}>0 replies</span>
                          <__Sw f={v.f} n="facebook_messenger" />
                        </div>
                      </div>
                    </section>
                    <section id="s3" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>{"Budget & office hours"}</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <__Link href="/set-usage" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Open AI Usage</__Link>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("monthly_budget_cap")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Monthly budget cap <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("monthly_budget_cap") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Billed in USD by the provider; converted at ৳121.40 for your reports.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "180px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
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
                            <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
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
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__In f={v.f} n="when_the_cap_is_reached" labelled desc opts={["Stop replying and alert admins","Keep replying and alert admins"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="when_the_cap_is_reached" />
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Alerts go to info@bugbuild.com and the admin inbox.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("office_hours")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Office hours</label>
                          </span>
                          <span id={v.f.id("office_hours") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Inside these hours the AI drafts and a human sends. Outside them it replies directly.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "340px" }}>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="office_hours" labelled desc />
                            </span>
                            <__Err f={v.f} n="office_hours" />
                            <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>to</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="office_hours_to" />
                            </span>
                            <__Err f={v.f} n="office_hours_to" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Asia/Dhaka · Friday is treated as a weekend for the support rota.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("escalation")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Escalation</label>
                          </span>
                          <span id={v.f.id("escalation") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Hands the thread to a human when the customer asks twice or mentions a refund.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__In f={v.f} n="escalation" labelled desc opts={["After 1 unresolved turn","After 2 unresolved turns","After 3 unresolved turns","Never hand over"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="escalation" />
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Provider<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>3</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Model<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>6</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Channels<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>3</span></a>
                      <a href="#s3" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>{"Budget & hours"}<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>4</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Model and budget changes take effect on the next incoming message.</span>
                  </aside>
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
