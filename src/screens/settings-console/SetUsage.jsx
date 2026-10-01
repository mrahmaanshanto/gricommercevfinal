'use client';
// Generated from design/templates/settings-console/SetUsage.dc.html by scripts/convert-design.mjs.
// SetUsage
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "usage";
  noSave = true;
  fields = {
    usage_month: {l: "Month", d: "September 2026"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      compare: !!this.state.compare,
      toggleCompare: () => this.setState((st) => ({ compare: !st.compare }), () => toast(this.state.compare ? "Comparing with August 2026: replies are up 18% and spend is up 12%." : "Comparison hidden.", { tone: "info" })),
      exportCsv: () => {
        const rows = [["Model", "Replies", "Input tokens", "Output tokens", "Cost (USD)"], ["Claude Sonnet 5", 842, 1184220, 253640, 7.36], ["Claude Haiku 4.5", 396, 412880, 86410, 0.84], ["Claude Opus 4.8", 46, 96140, 31880, 1.28], ["Llama-4-70b", 312, 388600, 92300, 0.31]];
        const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url; a.download = "ai-usage-" + String(f.get("usage_month", "September 2026")).toLowerCase().replace(/\s+/g, "-") + ".csv";
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast("Usage by model exported as CSV");
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
/* phone: the four figures sit two by two; the projection and the chart legend take their own line */
@media (max-width:640px){
  .set-kpis{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
  .set-sum>span:last-child,.set-chart-head>span:last-child{flex:1 1 100%;margin-left:0!important}
}`;

// ---- markup ----

export default class SetUsageScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetUsage">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="AI Usage" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="usage" /></div>
              <div className="set-shell__col">
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>AI Usage</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>A reporting view that lives inside settings: what the assistant cost this month, by model, against the cap you set.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "190px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__Icon name="calendar" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="usage_month" opts={["September 2026","August 2026","July 2026"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="usage_month" />
                          <button type="button" aria-pressed={v.compare} onClick={v.toggleCompare} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="chart-line" strokeWidth="1.75" width="15" height="15" />Compare</button>
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Read-only · mirrors provider billing</span>
                      </span>
                    </header>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Spend against budget</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>September 2026 · cap $120.00 · billed by Anthropic in USD.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>35% used</span>
                          <__Link href="/set-ai#s3" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Change cap</__Link>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px" }}>
                        <span style={{ display: "block" }}>
                          <span className="set-flow set-sum" style={{ display: "flex", alignItems: "baseline", gap: "10px", paddingBottom: "8px" }}>
                            <b style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</b>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>of $120.00 · ৳5,120 at ৳121.40</span>
                            <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Projected <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>$58.40</b> by 30 Sep</span>
                          </span>
                          <span style={{ display: "block", position: "relative", height: "10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                            <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            <span style={{ position: "absolute", left: "35%", width: "14%", height: "100%", background: "repeating-linear-gradient(135deg,rgba(0,156,222,.5) 0 4px,rgba(0,156,222,.18) 4px 8px)" }} />
                          </span>
                          <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "5px", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
                            <span>Spent</span>
                            <span>Projected</span>
                            <span>Cap $120</span>
                          </span>
                        </span>
                        <span className="set-kpis" style={{ display: "flex", gap: "12px" }}>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Replies</span>
                            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>1,596</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>+18% vs August</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Avg cost / reply</span>
                            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$0.026</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>≈ ৳3.20</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Resolved without a human</span>
                            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>71%</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1,133 of 1,596 threads</span>
                          </div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "13px 14px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Days at this rate</span>
                            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>87</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>before the cap is reached</span>
                          </div>
                        </span>
                        <span style={{ display: "block", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "14px 15px" }}>
                          <span className="set-flow set-chart-head" style={{ display: "flex", alignItems: "baseline", gap: "10px", paddingBottom: "10px" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Daily spend</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1–30 September · peak $2.41 on 27 Sep</span>
                            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#003087" }} />Settled</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#009cde" }} />Not yet billed</span>
                            </span>
                          </span>
                          <span style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "92px" }}>
                            <span title="1 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "22%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="2 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "34%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="3 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "18%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="4 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "41%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="5 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "52%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="6 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "30%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="7 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "26%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="8 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "48%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="9 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "61%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="10 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "44%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="11 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "38%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="12 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "55%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="13 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "70%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="14 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "62%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="15 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "49%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="16 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "33%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="17 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "58%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="18 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "66%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="19 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "74%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="20 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "51%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="21 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "43%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="22 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "60%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="23 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "68%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="24 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "57%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="25 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "46%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="26 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "72%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="27 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "80%", borderRadius: "3px 3px 0 0", background: "#003087", opacity: ".85" }} />
                            </span>
                            <span title="28 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "65%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                            <span title="29 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "54%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                            <span title="30 Sep" style={{ flex: "1", display: "flex", alignItems: "flex-end", height: "100%" }}>
                              <span style={{ display: "block", width: "100%", height: "47%", borderRadius: "3px 3px 0 0", background: "#009cde", opacity: "1" }} />
                            </span>
                          </span>
                          <span style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
                            <span>1 Sep</span>
                            <span>15 Sep</span>
                            <span>30 Sep</span>
                          </span>
                        </span>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Usage by model</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Read-only. Figures come from the provider’s billing API and are refreshed hourly.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Refreshed 4:00 PM</span>
                          <button type="button" onClick={v.exportCsv} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="download" strokeWidth="1.75" width="15" height="15" />Export CSV</button>
                        </span>
                      </div>
                      <div className="gc-table-wrap" style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Model</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Replies</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Input tokens</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Output tokens</th>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "right", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Cost (USD)</th>
                              <th style={{ padding: "9px 16px", borderBottom: "1px solid #e2e8f0", background: "#fcfdfe", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Share</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Sonnet 5</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Anthropic · current default</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>842</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>1,184,220</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>253,640</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$7.36</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "92%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Haiku 4.5</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Anthropic · used for FAQ intents</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>396</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>412,880</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>86,410</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$0.84</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "11%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Claude Opus 4.8</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Anthropic · escalated threads only</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>46</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>96,140</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>31,880</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$1.28</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "16%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Llama-4-70b</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Custom provider · Bangla-first replies</span>
                              </td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>312</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>388,600</td>
                              <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>92,300</td>
                              <td style={{ padding: "11px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>$0.31</td>
                              <td style={{ padding: "11px 16px 11px 8px", borderBottom: "1px solid #f1f5f9", width: "110px" }}>
                                <span style={{ display: "block", height: "6px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                  <span style={{ display: "block", width: "4%", height: "100%", background: "#003087" }} />
                                </span>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr style={{ background: "#f8fafc" }}>
                              <td style={{ padding: "11px 16px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>September total</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1,596</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2,081,840</td>
                              <td style={{ padding: "11px 8px", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>464,230</td>
                              <td style={{ padding: "11px 16px", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>$42.18</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 15px" }}>
                      <__Icon name="info" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                      <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>This tab is a report, not a form — nothing here is editable, so it has no save bar of its own. Change the cap or the model in <__Link href="/set-ai" style={{ fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>AI Auto-Reply</__Link>.</span>
                    </div>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Spend vs budget<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }} /></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Usage by model<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>4</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Token counts include system prompts and retrieved product context.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", minHeight: "64px", padding: "10px 24px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><__Icon name="lock" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />Read-only tab — nothing to save</span>
                  <span style={{ flex: "1" }} />
                  <__Link href="/set-ai" style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b", textDecoration: "none" }}><__Icon name="arrow-up-right" strokeWidth="1.75" width="15" height="15" />Open AI Auto-Reply settings</__Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
