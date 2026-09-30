'use client';
// Generated from design/templates/settings-console/SetSecurity.dc.html by scripts/convert-design.mjs.
// SetSecurity
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
.dc-h482:hover{background:#e9eef5 !important;color:#1e293b !important}
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
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome embedded /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar embedded crumb="API Security" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail embedded active="apisec" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>{"API Security & backups"}</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>The two places where a wrong click has consequences: the key every integration authenticates with, and the backups you would restore from.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Key active · 4 clients</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last backup 7 Sep 2026, 03:00</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>App API key</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Used by the Sellino mobile apps and by your own integrations. One key per store.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Active</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Key</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Send it as the X-App-Key header. Reveal and copy are recorded in the audit log.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>slk_live_••••••••••••••••3f7a</span>
                            <button className="dc-h482" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h483" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "14px", paddingTop: "2px", fontSize: "11.5px", color: "#64748b" }}>
                            <span>Last generated <b style={{ fontWeight: "600", color: "#475569", fontVariantNumeric: "tabular-nums" }}>2026-08-17 10:34:39</b></span>
                            <span>by Ashiq Khan</span>
                            <span>4 clients using it</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,87,36,.4)", borderRadius: "10px", background: "rgba(255,87,36,.04)", padding: "14px 15px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <__Icon name="triangle-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "#c2380f" }} />
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#8f2a0b" }}>Regenerate the API key</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>Cannot be undone</span>
                          </span>
                          <span style={{ fontSize: "12.5px", lineHeight: "18px", color: "#7a3312" }}>The old key stops working the moment the new one is issued. These clients break until they are updated: <b style={{ fontWeight: "600" }}>Sellino Android 4.2</b>, <b style={{ fontWeight: "600" }}>Sellino iOS 4.1</b>, <b style={{ fontWeight: "600" }}>Warehouse scanner gateway</b>, <b style={{ fontWeight: "600" }}>Zapier bridge</b>. Nightly stock sync would fail at 02:00.</span>
                          <span style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                            <span style={{ display: "flex", flexDirection: "column", gap: "6px", width: "280px" }}>
                              <span style={{ fontSize: "11.5px", color: "#7a3312" }}>Type <b style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontWeight: "600" }}>REGENERATE</b> to confirm</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #ff5724", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>REGENERA</span>
                              </span>
                            </span>
                            <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "38px", border: "none", borderRadius: "8px", background: "#e2e8f0", padding: "0 15px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "600", color: "#94a3b8", cursor: "not-allowed" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />Regenerate key</button>
                            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Two characters to go</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px", fontSize: "11.5px", color: "#64748b" }}><__Icon name="history" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />Previous keys: 17 Aug 2026 (current) · 02 Mar 2026 · 14 Nov 2025<span style={{ marginLeft: "auto" }} /><button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="scroll-text" strokeWidth="1.75" width="15" height="15" />Open audit log</button></div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Database backup</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Nightly mysqldump pushed to Google Drive. Retention 30 days.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Healthy</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#003087", color: "#fff" }}><__Icon name="play" strokeWidth="1.75" width="15" height="15" />Run backup now</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 4px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Automatic nightly backup</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Runs at 03:00 Asia/Dhaka. A failure emails info@bugbuild.com and raises a banner in the admin.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "8px 18px 16px" }}>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Last backup</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>7 Sep 2026, 03:00</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>succeeded in 2 m 14 s</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Size</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>148.2 MB</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>gzip · 30-day retention</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Next run</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>Tonight, 03:00</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>in 10 h 46 m</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "0 18px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Google client ID <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>{"Google Cloud console → APIs & Services → "}<b style={{ fontWeight: "600", color: "#475569" }}>Credentials</b> → OAuth client.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>4189-••••.apps.googleusercontent.com</span>
                            <button className="dc-h484" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Google client secret <span style={{ color: "#c2380f" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Saved</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Stored encrypted.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#94a3b8" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 14 Jul 2026</span>
                            <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Drive refresh token <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Issued once when you authorise the app. Re-authorise if backups start failing with 401.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1//0e••••••••••••••ZxQ</span>
                            <button className="dc-h485" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h486" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Token refreshed 3 h ago</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Drive folder ID <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>From the folder URL after /folders/. The service account needs write access.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1x9KfQ2m8ZbT4pLvN7</span>
                            <button className="dc-h487" aria-label="Open in Drive" title="Open in Drive" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="external-link" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>mysqldump path</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Absolute path on the app server. Leave as-is unless MySQL is installed somewhere unusual.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/usr/bin/mysqldump</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Drive quota</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Read from Google. Backups stop when the account is full.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 11px", fontSize: "13.5px", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>12.4 GB of 100 GB used</span>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "0 18px 18px", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "9px", background: "#f8fafc", padding: "10px 13px", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="chevron-right" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />Advanced endpoints<span style={{ fontWeight: "400", color: "#94a3b8" }}>3 Google API URLs · defaults are correct unless Google changes them</span><span style={{ marginLeft: "auto" }}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Default</span>
</span></span>
                      </div>
                      <div style={{ borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", background: "#fcfdfe", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>
                          <span style={{ width: "150px", flex: "none" }}>When</span>
                          <span style={{ width: "76px", flex: "none" }}>Size</span>
                          <span style={{ width: "76px", flex: "none" }}>Duration</span>
                          <span style={{ flex: "1" }}>Result</span>
                          <span style={{ width: "70px", flex: "none" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>7 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>148.2 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>2m 14s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h488" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h489" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>6 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>147.8 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>2m 09s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h490" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h491" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>5 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>147.1 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>2m 22s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h492" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h493" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>—</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>0m 41s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>Failed · Drive quota check timed out</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h494" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h495" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3 Sep 2026, 03:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>146.4 MB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>2m 11s</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h496" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h497" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "10px 16px", fontSize: "11.5px", color: "#64748b" }}>29 of 30 nightly runs succeeded this month<span style={{ marginLeft: "auto" }} /><a href="#" style={{ fontWeight: "500", color: "#003087", textDecoration: "none" }}>Full backup history</a></div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>File backup</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Product images and invoices, uploaded to Drive in resumable chunks.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>Needs attention</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="play" strokeWidth="1.75" width="15" height="15" />Run backup now</button>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 4px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Automatic weekly backup</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Runs Friday 04:00. 61.4 GB of media takes roughly 3 hours at the current chunk size.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "8px 18px 16px" }}>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Last backup</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 04:00</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>partial · 2 chunks failed</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Chunk size</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>24 MB</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>raise it on a fast link</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px 13px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8" }}>Next run</span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>Fri 11 Sep, 04:00</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>in 3 d 11 h</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "0 18px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Chunk size (MB)</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Larger chunks are faster but retry more data on a dropped connection. 8–32 MB is sensible.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>24</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Drive folder ID <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Separate folder from the database dumps.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1pQ7ZmV2nR8sK4TbY</span>
                            <button className="dc-h498" aria-label="Open in Drive" title="Open in Drive" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="external-link" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "0 18px 18px", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "9px", background: "#f8fafc", padding: "10px 13px", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="chevron-right" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />Advanced endpoints<span style={{ fontWeight: "400", color: "#94a3b8" }}>4 Google API URLs · defaults are correct unless Google changes them</span><span style={{ marginLeft: "auto" }}>
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>Default</span>
</span></span>
                      </div>
                      <div style={{ borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4 Sep 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>58.9 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>3h 12m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "#b36a00" }}>Partial · 2 of 1,842 chunks failed</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h499" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h500" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>28 Aug 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>57.2 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>3h 04m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h501" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h502" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px" }}>
                          <span style={{ width: "150px", flex: "none", fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>21 Aug 2026, 04:00</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>55.8 GB</span>
                          <span style={{ width: "76px", flex: "none", fontSize: "12px", color: "#64748b", fontVariantNumeric: "tabular-nums" }}>2h 58m</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Uploaded to Drive</span>
                          </span>
                          <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                            <button className="dc-h503" aria-label="Download" title="Download" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h504" aria-label="Restore" title="Restore" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="rotate-ccw" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>App API key<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>1</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Database backup<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>9</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>File backup<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>10</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Destructive actions need a typed confirmation, never a single click.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}><__Icon name="circle-check" strokeWidth="1.75" width="17" height="17" style={{ color: "#10b981" }} />All changes saved<span style={{ color: "#94a3b8" }}>· 7 Sep, 03:02 · automated</span></span>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S saves from anywhere on the page</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "40px", borderRadius: "8px", padding: "0 14px", fontSize: "13px", fontWeight: "500", color: "#cbd5e1", cursor: "not-allowed" }}>Discard</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: "40px", borderRadius: "8px", background: "#f1f5f9", padding: "0 18px", fontSize: "13px", fontWeight: "500", letterSpacing: ".02em", color: "#94a3b8", cursor: "not-allowed" }}>Save changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
