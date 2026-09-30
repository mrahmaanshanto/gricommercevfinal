'use client';
// Generated from design/templates/settings-console/SetSecurity.dc.html by scripts/convert-design.mjs.
// SetSecurity
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast, confirmDialog } from '@/runtime/ui';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "security";
  fields = {
    automatic_nightly_backup: {l: "Automatic nightly backup", d: true},
    automatic_weekly_backup: {l: "Automatic weekly backup", d: true},
    app_api_key: {l: "App API key", d: "slk_live_••••••••••••••••3f7a"},
    google_client_id: {l: "Google client ID", d: "4189-••••.apps.googleusercontent.com", req: true},
    drive_refresh_token: {l: "Drive refresh token", d: "1//0e••••••••••••••ZxQ", req: true},
    db_drive_folder_id: {l: "Drive folder ID", d: "1x9KfQ2m8ZbT4pLvN7", req: true},
    mysqldump_path: {l: "mysqldump path", d: "/usr/bin/mysqldump"},
    chunk_size_mb: {l: "Chunk size (MB)", d: "24", k: "int", req: true, check: (x) => (+x < 1 || +x > 256 ? "Choose a chunk size from 1 to 256 MB." : "")},
    file_drive_folder_id: {l: "Drive folder ID", d: "1pQ7ZmV2nR8sK4TbY", req: true},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      regen: this.state.regen || "",
      setRegen: (e) => this.setState({ regen: e.target.value.toUpperCase() }),
      regenReady: (this.state.regen || "") === "REGENERATE",
      regenLeft: (() => {
        const typed = this.state.regen || "";
        if (typed === "REGENERATE") return "Ready. This cannot be undone.";
        if (!typed) return "Type the word to unlock the button";
        if (!"REGENERATE".startsWith(typed)) return "That does not match. Check the spelling.";
        const left = 10 - typed.length;
        return left + (left === 1 ? " character to go" : " characters to go");
      })(),
      regenerate: async () => {
        if ((this.state.regen || "") !== "REGENERATE") { toast("Type REGENERATE in the box first.", { tone: "info" }); return; }
        if (await confirmDialog({ title: "Regenerate the API key?", body: "The current key stops working at once. 4 clients will fail until they are given the new key.", confirmLabel: "Regenerate key", tone: "danger" })) {
          this.setState({ regen: "" });
          f.set("app_api_key", "slk_live_••••••••••••••••9c2e");
          toast("New API key issued. Save changes, then update your 4 clients.");
        }
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h482:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h483:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h484:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h485:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h486:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h487:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h488:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h489:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h490:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h491:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h492:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h493:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h494:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h495:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h496:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h497:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h498:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h499:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h500:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h501:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h502:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h503:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h504:hover{background:#e9eef5 !important;color:#1e293b !important}`;

// ---- markup ----

export default class SetSecurityScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetSecurity">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="API Security" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="apisec" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>{"API Security & backups"}</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>The two places where a wrong click has consequences: the key every integration authenticates with, and the backups you would restore from.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Key active · 4 clients</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last backup 7 Sep 2026, 03:00</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>App API key</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Used by the GridCommerce mobile apps and by your own integrations. One key per store.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Active</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("app_api_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Key</label>
                          </span>
                          <span id={v.f.id("app_api_key") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Send it as the X-App-Key header. Reveal and copy are recorded in the audit log.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="app_api_key" labelled desc />
                            <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h482" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.copy("app_api_key")} className="dc-h483" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="app_api_key" />
                          <span style={{ display: "flex", alignItems: "center", gap: "14px", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            <span>Last generated <b style={{ fontWeight: "var(--weight-medium)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>2026-08-17 10:34:39</b></span>
                            <span>by Ashiq Khan</span>
                            <span>4 clients using it</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,87,36,.4)", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.04)", padding: "14px 15px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <__Icon name="triangle-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-danger)" }} />
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#8f2a0b" }}>Regenerate the API key</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "var(--text-danger)" }}>Cannot be undone</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#7a3312" }}>The old key stops working the moment the new one is issued. These clients break until they are updated: <b style={{ fontWeight: "var(--weight-medium)" }}>GridCommerce Android 4.2</b>, <b style={{ fontWeight: "var(--weight-medium)" }}>GridCommerce iOS 4.1</b>, <b style={{ fontWeight: "var(--weight-medium)" }}>Warehouse scanner gateway</b>, <b style={{ fontWeight: "var(--weight-medium)" }}>Zapier bridge</b>. Nightly stock sync would fail at 02:00.</span>
                          <span className="set-wrap" style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                            <span style={{ display: "flex", flexDirection: "column", gap: "6px", width: "280px" }}>
                              <label htmlFor="sf-security-regen" style={{ fontSize: "var(--text-xs)", color: "#7a3312" }}>Type <b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)" }}>REGENERATE</b> to confirm</label>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                                <input id="sf-security-regen" className="set-in" value={v.regen} onChange={v.setRegen} autoComplete="off" spellCheck={false} aria-describedby="sf-security-regen-left" />
                              </span>
                            </span>
                            <button type="button" aria-disabled={v.regenReady ? undefined : "true"} onClick={v.regenerate} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: v.regenReady ? "var(--fill-danger, #c2410c)" : "#e2e8f0", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: v.regenReady ? "#fff" : "#475569", cursor: v.regenReady ? "pointer" : "not-allowed" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />Regenerate key</button>
                            <span id="sf-security-regen-left" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.regenLeft}</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="history" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />Previous keys: 17 Aug 2026 (current) · 02 Mar 2026 · 14 Nov 2025<span style={{ marginLeft: "auto" }} /><button type="button" onClick={v.f.say("“Open audit log” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="scroll-text" strokeWidth="1.75" width="15" height="15" />Open audit log</button></div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Database backup</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Nightly mysqldump pushed to Google Drive. Retention 30 days.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Healthy</span>
                          <button type="button" onClick={v.f.say("Backup started. You will get an email when it finishes.", "success")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="play" strokeWidth="1.75" width="15" height="15" />Run backup now</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 4px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Automatic nightly backup</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Runs at 03:00 Asia/Dhaka. A failure emails info@bugbuild.com and raises a banner in the admin.</span>
                          </span>
                          <__Sw f={v.f} n="automatic_nightly_backup" />
                        </div>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "8px 18px 16px" }}>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Last backup</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>7 Sep 2026, 03:00</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>succeeded in 2 m 14 s</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Size</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>148.2 MB</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>gzip · 30-day retention</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Next run</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>Tonight, 03:00</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>in 10 h 46 m</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "0 18px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("google_client_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Google client ID <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("google_client_id") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>{"Google Cloud console → APIs & Services → "}<b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Credentials</b> → OAuth client.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="google_client_id" labelled desc />
                            <button type="button" onClick={v.f.copy("google_client_id")} className="dc-h484" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="google_client_id" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Google client secret <span style={{ color: "var(--text-danger)" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Saved</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Stored encrypted.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 14 Jul 2026</span>
                            <button type="button" onClick={v.f.say("“Replace” is not available in the demo yet.")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("drive_refresh_token")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Drive refresh token <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("drive_refresh_token") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Issued once when you authorise the app. Re-authorise if backups start failing with 401.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="drive_refresh_token" labelled desc />
                            <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h485" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.copy("drive_refresh_token")} className="dc-h486" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="drive_refresh_token" />
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Token refreshed 3 h ago</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("db_drive_folder_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Drive folder ID <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("db_drive_folder_id") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>From the folder URL after /folders/. The service account needs write access.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="db_drive_folder_id" labelled desc />
                            <button type="button" onClick={v.f.say("“Open in Drive” is not available in the demo yet.")} className="dc-h487" aria-label="Open in Drive" title="Open in Drive" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="external-link" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="db_drive_folder_id" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("mysqldump_path")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>mysqldump path</label>
                          </span>
                          <span id={v.f.id("mysqldump_path") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Absolute path on the app server. Leave as-is unless MySQL is installed somewhere unusual.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="mysqldump_path" labelled desc />
                          </span>
                          <__Err f={v.f} n="mysqldump_path" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Drive quota</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Read from Google. Backups stop when the account is full.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>12.4 GB of 100 GB used</span>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "0 18px 18px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                        <button className="set-disc" {...v.f.disc("adv_db", false)} style={{ display: "flex", alignItems: "center", gap: "9px", background: "#f8fafc", padding: "10px 13px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", gap: "9px" }}><__Icon name="chevron-down" className="set-disc__chev" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} aria-hidden="true" />Advanced endpoints<span style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>3 Google API URLs · defaults are correct unless Google changes them</span><span style={{ marginLeft: "auto" }}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Default</span>
</span></button>
                        <div {...v.f.panel("adv_db", false)} style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #e2e8f0", padding: "12px 13px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Token URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://oauth2.googleapis.com/token</span></span>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Upload URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://www.googleapis.com/upload/drive/v3/files</span></span>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Quota URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://www.googleapis.com/drive/v3/about</span></span>
                          <span>These are Google’s published addresses. They are shown for reference and cannot be edited here.</span>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", background: "#fcfdfe", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
                          <span style={{ width: "150px", flex: "none" }}>When</span>
                          <span style={{ width: "76px", flex: "none" }}>Size</span>
                          <span style={{ width: "76px", flex: "none" }}>Duration</span>
                          <span style={{ flex: "1" }}>Result</span>
                          <span style={{ width: "70px", flex: "none" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>7 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>148.2 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2m 14s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 7 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h488" aria-label="Download the backup from 7 Sep 2026, 03:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 7 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h489" aria-label="Restore the backup from 7 Sep 2026, 03:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>6 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>147.8 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2m 09s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 6 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h490" aria-label="Download the backup from 6 Sep 2026, 03:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 6 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h491" aria-label="Restore the backup from 6 Sep 2026, 03:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>5 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>147.1 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2m 22s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 5 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h492" aria-label="Download the backup from 5 Sep 2026, 03:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 5 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h493" aria-label="Restore the backup from 5 Sep 2026, 03:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>—</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>0m 41s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "var(--text-danger)" }}>Failed · Drive quota check timed out</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 4 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h494" aria-label="Download the backup from 4 Sep 2026, 03:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 4 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h495" aria-label="Restore the backup from 4 Sep 2026, 03:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>146.4 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2m 11s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 3 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h496" aria-label="Download the backup from 3 Sep 2026, 03:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 3 Sep 2026, 03:00” is not available in the demo yet.")} className="dc-h497" aria-label="Restore the backup from 3 Sep 2026, 03:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "10px 16px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>29 of 30 nightly runs succeeded this month<span style={{ marginLeft: "auto" }} /><button type="button" onClick={v.f.say("“Full backup history” is not available in the demo yet.")} style={{ border: "none", background: "none", padding: "0", fontFamily: "inherit", cursor: "pointer", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Full backup history</button></div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>File backup</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Product images and invoices, uploaded to Drive in resumable chunks.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "var(--text-warning)" }}>Needs attention</span>
                          <button type="button" onClick={v.f.say("Backup started. You will get an email when it finishes.", "success")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="play" strokeWidth="1.75" width="15" height="15" />Run backup now</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 4px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Automatic weekly backup</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Runs Friday 04:00. 61.4 GB of media takes roughly 3 hours at the current chunk size.</span>
                          </span>
                          <__Sw f={v.f} n="automatic_weekly_backup" />
                        </div>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "8px 18px 16px" }}>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Last backup</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 04:00</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>partial · 2 chunks failed</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Chunk size</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>24 MB</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>raise it on a fast link</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "11px 13px" }}>
                          <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Next run</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>Fri 11 Sep, 04:00</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>in 3 d 11 h</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "0 18px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("chunk_size_mb")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Chunk size (MB)</label>
                          </span>
                          <span id={v.f.id("chunk_size_mb") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Larger chunks are faster but retry more data on a dropped connection. 8–32 MB is sensible.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__In f={v.f} n="chunk_size_mb" labelled desc />
                          </span>
                          <__Err f={v.f} n="chunk_size_mb" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("file_drive_folder_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Drive folder ID <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("file_drive_folder_id") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Separate folder from the database dumps.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="file_drive_folder_id" labelled desc />
                            <button type="button" onClick={v.f.say("“Open in Drive” is not available in the demo yet.")} className="dc-h498" aria-label="Open in Drive" title="Open in Drive" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="external-link" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="file_drive_folder_id" />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "0 18px 18px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                        <button className="set-disc" {...v.f.disc("adv_file", false)} style={{ display: "flex", alignItems: "center", gap: "9px", background: "#f8fafc", padding: "10px 13px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", gap: "9px" }}><__Icon name="chevron-down" className="set-disc__chev" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} aria-hidden="true" />Advanced endpoints<span style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>4 Google API URLs · defaults are correct unless Google changes them</span><span style={{ marginLeft: "auto" }}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Default</span>
</span></button>
                        <div {...v.f.panel("adv_file", false)} style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #e2e8f0", padding: "12px 13px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Token URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://oauth2.googleapis.com/token</span></span>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Upload URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://www.googleapis.com/upload/drive/v3/files</span></span>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Files URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://www.googleapis.com/drive/v3/files</span></span>
                          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}><span style={{ flex: "none", width: "96px", color: "#475569" }}>Quota URL</span><span style={{ flex: "1", minWidth: "0", fontFamily: "var(--font-data)", overflowWrap: "anywhere" }}>https://www.googleapis.com/drive/v3/about</span></span>
                          <span>These are Google’s published addresses. They are shown for reference and cannot be edited here.</span>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>58.9 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>3h 12m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "var(--text-warning)" }}>Partial · 2 of 1,842 chunks failed</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 4 Sep 2026, 04:00” is not available in the demo yet.")} className="dc-h499" aria-label="Download the backup from 4 Sep 2026, 04:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 4 Sep 2026, 04:00” is not available in the demo yet.")} className="dc-h500" aria-label="Restore the backup from 4 Sep 2026, 04:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>28 Aug 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>57.2 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>3h 04m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 28 Aug 2026, 04:00” is not available in the demo yet.")} className="dc-h501" aria-label="Download the backup from 28 Aug 2026, 04:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 28 Aug 2026, 04:00” is not available in the demo yet.")} className="dc-h502" aria-label="Restore the backup from 28 Aug 2026, 04:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "var(--text-xs)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>21 Aug 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>55.8 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2h 58m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button type="button" onClick={v.f.say("“Download the backup from 21 Aug 2026, 04:00” is not available in the demo yet.")} className="dc-h503" aria-label="Download the backup from 21 Aug 2026, 04:00" title="Download" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.say("“Restore the backup from 21 Aug 2026, 04:00” is not available in the demo yet.")} className="dc-h504" aria-label="Restore the backup from 21 Aug 2026, 04:00" title="Restore" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>App API key<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>1</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Database backup<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>9</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>File backup<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>10</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Destructive actions need a typed confirmation, never a single click.</span>
                  </aside>
                </div>
                <__SaveBar f={v.f} note="· 7 Sep, 3:02 AM, automated" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
