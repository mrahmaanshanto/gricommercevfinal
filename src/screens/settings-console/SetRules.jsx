'use client';
// Generated from design/templates/settings-console/SetRules.dc.html by scripts/convert-design.mjs.
// SetRules
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetChk as __Chk, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "rules";
  savedMessage = 'Auto-reply rules saved';
  fields = {
    rule_1_on: {l: "Rule 1 enabled", d: true},
    rule_2_on: {l: "Rule 2 enabled", d: true},
    rule_3_on: {l: "Rule 3 enabled", d: true},
    rule_4_on: {l: "Rule 4 enabled", d: true},
    rule_5_on: {l: "Rule 5 enabled", d: false},
    rule_enabled: {l: "Rule enabled", d: true},
    rule_type: {l: "Rule type", d: "Intent"},
    intent: {l: "Intent", d: "return_or_exchange"},
    ch_widget: {l: "Website widget", d: true},
    ch_whatsapp: {l: "WhatsApp", d: true},
    ch_messenger: {l: "Messenger", d: true},
    response: {l: "Response", d: "Returns are accepted within {policy_days} days of delivery with the original packaging. Share your order code and I’ll start the request for you.", k: "area", req: true},
    priority: {l: "Priority", d: "3", k: "int", req: true},
    then: {l: "Then", d: "Offer return form"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      chan: this.state.chan || "All channels",
      setChan: (e) => this.setState({ chan: e.target.value }),
      // a rule is listed when it answers on the chosen channel
      show: (row) => {
        const c = this.state.chan || "All channels";
        const on = { 1: "all", 2: "WhatsApp Website widget", 3: "all", 4: "Website widget Messenger", 5: "Messenger" }[row];
        return c === "All channels" || on === "all" || on.includes(c);
      },
      onCount: [1, 2, 3, 4, 5].filter((n) => f.get("rule_" + n + "_on", false)).length,
      editor: this.state.editor !== false,
      openEditor: () => this.setState({ editor: true }, () => f.focus("rule_type")),
      closeEditor: () => this.setState({ editor: false }),
      cancelRule: () => { f.discard(); },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h466:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h467:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h468:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h469:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h470:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h471:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h472:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h473:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h474:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h475:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h476:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h477:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h478:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h479:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h480:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h481:hover{background:#f1f5f9 !important;color:#475569 !important}`;

// ---- markup ----

export default class SetRulesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetRules">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="Auto-Reply Rules" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="rules" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Auto-Reply Rules</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>Deterministic answers that run before the AI does — for the questions where an exact reply matters more than a clever one.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>5 rules · {v.onCount} on</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last edited 6 Sep 2026, 9:41 PM</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Rules</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Checked top to bottom; the first match wins. Anything unmatched goes to the AI reply, or to the inbox if AI is off.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>5 rules · {v.onCount} on</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "150px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <select className="set-in" aria-label="Show rules for channel" value={v.chan} onChange={v.setChan}>{["All channels", "Website widget", "WhatsApp", "Messenger"].map((o) => <option key={o} value={o}>{o}</option>)}</select>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <button type="button" onClick={v.f.say("“Add rule” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add rule</button>
                        </span>
                      </div>
                      <div className="gc-table-wrap" style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 8px 9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Priority</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Type</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Channel</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Trigger</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Response</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }} />
                            </tr>
                          </thead>
                          <tbody>
                            <tr hidden={!v.show(1)}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />1</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", color: "#475569" }}>All channels</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>“order status”, “অর্ডার কোথায়”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "280px" }}>Asks for the order code, then returns live status from the courier.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <__Sw f={v.f} n="rule_1_on" />
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button type="button" onClick={v.f.say("“Edit rule 1” is not available in the demo yet.")} className="dc-h466" aria-label="Edit rule 1" title="Edit rule 1" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Duplicate rule 1” is not available in the demo yet.")} className="dc-h467" aria-label="Duplicate rule 1" title="Duplicate rule 1" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Delete rule 1” is not available in the demo yet.")} className="dc-h468" aria-label="Delete rule 1" title="Delete rule 1" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr hidden={!v.show(2)}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />2</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", color: "#475569" }}>WhatsApp · Widget</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>“bkash number”, “payment number”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "280px" }}>Sends the bKash merchant number and the send-money steps.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <__Sw f={v.f} n="rule_2_on" />
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button type="button" onClick={v.f.say("“Edit rule 2” is not available in the demo yet.")} className="dc-h469" aria-label="Edit rule 2" title="Edit rule 2" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Duplicate rule 2” is not available in the demo yet.")} className="dc-h470" aria-label="Duplicate rule 2" title="Duplicate rule 2" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Delete rule 2” is not available in the demo yet.")} className="dc-h471" aria-label="Delete rule 2" title="Delete rule 2" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr hidden={!v.show(3)} style={{ background: "rgba(0,48,135,.05)" }}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />3</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Intent</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", color: "#475569" }}>All channels</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>return_or_exchange</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "280px" }}>Explains the 7-day policy and offers to open a return request.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <__Sw f={v.f} n="rule_3_on" />
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button type="button" aria-expanded={v.editor} onClick={v.openEditor} className="dc-h472" aria-label="Edit rule 3" title="Edit rule 3" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Duplicate rule 3” is not available in the demo yet.")} className="dc-h473" aria-label="Duplicate rule 3" title="Duplicate rule 3" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Delete rule 3” is not available in the demo yet.")} className="dc-h474" aria-label="Delete rule 3" title="Delete rule 3" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr hidden={!v.show(4)}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />4</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "var(--text-warning)" }}>Schedule</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", color: "#475569" }}>Widget · Messenger</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>outside 10:00–20:00</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "280px" }}>Posts the office-hours notice in Bangla and English, then queues the thread.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <__Sw f={v.f} n="rule_4_on" />
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button type="button" onClick={v.f.say("“Edit rule 4” is not available in the demo yet.")} className="dc-h475" aria-label="Edit rule 4" title="Edit rule 4" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Duplicate rule 4” is not available in the demo yet.")} className="dc-h476" aria-label="Duplicate rule 4" title="Duplicate rule 4" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Delete rule 4” is not available in the demo yet.")} className="dc-h477" aria-label="Delete rule 4" title="Delete rule 4" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                            <tr hidden={!v.show(5)}>
                              <td style={{ padding: "10px 8px 10px 16px", borderBottom: "1px solid #f1f5f9", width: "52px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" style={{ color: "#cbd5e1" }} />5</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>Keyword</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", color: "#475569" }}>Messenger</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>“wholesale”, “পাইকারি”</span>
                              </td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "280px" }}>Collects quantity and city, then tags the thread for the B2B desk.</td>
                              <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <__Sw f={v.f} n="rule_5_on" />
                              </td>
                              <td style={{ padding: "10px 16px 10px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", whiteSpace: "nowrap" }}>
                                <span style={{ display: "inline-flex", gap: "4px" }}>
                                  <button type="button" onClick={v.f.say("“Edit rule 5” is not available in the demo yet.")} className="dc-h478" aria-label="Edit rule 5" title="Edit rule 5" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Duplicate rule 5” is not available in the demo yet.")} className="dc-h479" aria-label="Duplicate rule 5" title="Duplicate rule 5" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                  <button type="button" onClick={v.f.say("“Delete rule 5” is not available in the demo yet.")} className="dc-h480" aria-label="Delete rule 5" title="Delete rule 5" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                    <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="set-flow" style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "11px 16px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="info" strokeWidth="1.75" width="15" height="15" style={{ flex: "none", color: "var(--text-muted)" }} /><span className="set-grow">Drag the handle to reorder. Rule 3 is open in the editor.</span><span style={{ marginLeft: "auto" }}>1,284 rule matches this month · 43% of all replies</span></div>
                    </section>
                  </main>
                  <aside className="set-side" aria-label="Edit rule 3" hidden={!v.editor} style={{ width: "352px", flex: "none", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 12px 30px -16px rgba(15,23,42,.3)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ display: "block" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Edit rule 3</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Intent · return_or_exchange</span>
                      </span>
                      <button type="button" className="dc-h481" aria-label="Close the rule editor" onClick={v.closeEditor} style={{ marginLeft: "auto", width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
                      </button>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", display: "flex", flexDirection: "column", gap: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <label htmlFor={v.f.id("rule_type")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rule type</label>
                        </span>
                        <span id={v.f.id("rule_type") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Keyword matches text; intent uses the model’s classification; schedule fires on time of day.</span>
                        <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                          <__In f={v.f} n="rule_type" labelled desc opts={["Keyword","Intent","Schedule"]} />
                          <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                        </span>
                        <__Err f={v.f} n="rule_type" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <label htmlFor={v.f.id("intent")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Intent</label>
                        </span>
                        <span id={v.f.id("intent") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Trained intents from your last 90 days of conversations.</span>
                        <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                          <__In f={v.f} n="intent" labelled desc opts={["return_or_exchange","order_status","payment_help","wholesale_enquiry"]} />
                          <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                        </span>
                        <__Err f={v.f} n="intent" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Channels</span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Leave all three on unless the wording differs per channel.</span>
                        <span role="group" aria-label="Channels" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <__Chk chip f={v.f} n="ch_widget" title="Website widget" />
                          <__Chk chip f={v.f} n="ch_whatsapp" title="WhatsApp" />
                          <__Chk chip f={v.f} n="ch_messenger" title="Messenger" />
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <label htmlFor={v.f.id("response")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Response</label>
                        </span>
                        <span id={v.f.id("response") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>{"Supports {order_code}, {customer_name} and {policy_days}. Bangla version is generated on send."}</span>
                        <div className="set-box" style={{ border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "9px 11px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#1e293b" }}><__In f={v.f} n="response" labelled desc rows={4} /></div>
                        <__Err f={v.f} n="response" />
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="languages" strokeWidth="1.75" width="13" height="13" />Bangla preview available after saving</span>
                      </div>
                      <span style={{ display: "flex", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("priority")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Priority</label>
                          </span>
                          <span id={v.f.id("priority") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Lower runs first.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "80px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__In f={v.f} n="priority" labelled desc />
                          </span>
                          <__Err f={v.f} n="priority" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("then")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Then</label>
                          </span>
                          <span id={v.f.id("then") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>What happens after the reply.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__In f={v.f} n="then" labelled desc opts={["Offer return form","Hand the thread to a human","Close the thread"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="then" />
                        </div>
                      </span>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rule enabled</span>
                          <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Turning this off keeps the rule but stops it matching.</span>
                        </span>
                        <__Sw f={v.f} n="rule_enabled" />
                      </div>
                    </div>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "12px 16px" }}>
                      <button type="button" onClick={v.f.say("Deleting a rule is not available in the demo yet.")} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Delete</button>
                      <span style={{ flex: "1" }} />
                      <button type="button" onClick={v.cancelRule} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}>Cancel</button>
                      <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="check" strokeWidth="1.75" width="15" height="15" />Save rule</button>
                    </div>
                  </aside>
                </div>
                <__SaveBar f={v.f} note="· 9:41 PM by Nusrat Jahan" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
