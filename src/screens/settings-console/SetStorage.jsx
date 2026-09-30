'use client';
// Generated from design/templates/settings-console/SetStorage.dc.html by scripts/convert-design.mjs.
// SetStorage
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
.dc-h512:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h513:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h514:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h515:hover{background:#002a77 !important}`;

// ---- markup ----

export default class SetStorageScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetStorage">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="Storage" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="storage" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Storage</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>One driver choice decides which credentials matter. Only the fields that apply are shown; the rest are named, not hidden silently.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>Test failed · not saved</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>48,210 files · 61.4 GB stored</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Storage driver</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Where product images, invoices and backups are written. The fields below change with this choice.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>S3-compatible</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "1.5px solid #cbd5e1", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Local disk</span>
                          </span>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>public/storage on the app server. Simplest, but images are lost if the server is rebuilt.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "1.5px solid #cbd5e1", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Amazon S3</span>
                          </span>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>AWS-hosted buckets. Region and bucket only — no endpoint needed.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #003087", borderRadius: "10px", background: "rgba(0,48,135,.04)", padding: "12px 13px", boxShadow: "0 0 0 3px rgba(0,48,135,.08)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "5px solid #003087", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>S3-compatible</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "#0089c3" }}>Active</span>
                          </span>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>DigitalOcean Spaces, Wasabi, MinIO, Backblaze B2. Needs a custom endpoint.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", borderRadius: "9999px", border: "1.5px solid #cbd5e1", background: "#fff" }} />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Cloudflare R2</span>
                          </span>
                          <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Zero egress fees. Uses an account-scoped endpoint and a token pair.</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "11px", margin: "0 18px 18px", border: "1px solid rgba(255,152,0,.4)", borderRadius: "9px", background: "rgba(255,152,0,.08)", padding: "11px 13px" }}>
                        <__Icon name="shield-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "#b36a00" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "12.5px", lineHeight: "18px", color: "#7a4a00" }}>Changing the driver asks for confirmation. Existing files are <b style={{ fontWeight: "600" }}>not</b> migrated — 48,210 images would need to be copied first, and the storefront serves broken images until they are.</span>
                        <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="arrow-right-left" strokeWidth="1.75" width="15" height="15" />Plan a migration</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "9px", background: "#f8fafc", padding: "10px 13px", opacity: ".75" }}>
                        <__Icon name="eye-off" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>Hidden for this driver: <b style={{ fontWeight: "500", color: "#475569" }}>Local disk path</b>, <b style={{ fontWeight: "500", color: "#475569" }}>Symlink public folder</b>, <b style={{ fontWeight: "500", color: "#475569" }}>AWS region preset</b>.</span>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>S3-compatible credentials</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>DigitalOcean → Spaces → <b style={{ fontWeight: "600", color: "#475569" }}>API → Spaces keys</b>. The key pair is shown once at creation.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>Test failed</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Access key ID <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Public half of the pair. Safe to copy into a support ticket.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>DO00••••••••••P9RT</span>
                            <button className="dc-h512" aria-label="Reveal" title="Reveal" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h513" aria-label="Copy" title="Copy" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Secret access key <span style={{ color: "#c2380f" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "#059669" }}>Saved</span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Stored encrypted and never re-displayed. Replace it if you rotate the pair.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "13.5px", color: "#94a3b8" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 17 Aug 2026</span>
                            <button style={{ height: "30px", border: "none", borderRadius: "7px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Bucket <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Must already exist. Sellino will not create it for you.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sellino-media-bd</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Region <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>The datacentre slug, not the display name.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", width: "200px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>blr1</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                        </div>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Endpoint <span style={{ color: "#c2380f" }}>*</span></span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Full origin for the S3 API. Scheme required, no bucket, no trailing slash.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #ff5724", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px", boxShadow: "0 0 0 3px rgba(255,87,36,.12)" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sellino-media-bd.blr1.digitaloceanspaces.com/</span>
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", paddingTop: "4px", fontSize: "11.5px", color: "#c2380f" }}><__Icon name="circle-alert" strokeWidth="1.75" width="13" height="13" />Missing https:// and has a trailing slash. Expected https://blr1.digitaloceanspaces.com</span>
                          </div>
                        </span>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Public URL / CDN base <span style={{ color: "#c2380f" }}>*</span></span>
                            </span>
                            <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>What the storefront links to. Use the CDN hostname so images are cached at the edge.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12.5px" }}>
                              <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://cdn.sellino.com.bd</span>
                            </span>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>Resulting image URL: <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", color: "#334155" }}>https://cdn.sellino.com.bd/products/8842/front-800.webp</span></span>
                          </div>
                        </span>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Path-style endpoint</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Puts the bucket in the path instead of the hostname. MinIO and older gateways need this on; DigitalOcean Spaces needs it off.</span>
                            </span>
                            <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", width: "38px", height: "22px", borderRadius: "9999px", background: "#cbd5e1", padding: "2px", cursor: "pointer" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.2)" }} />
                            </span>
                          </div>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "11px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 18px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", borderRadius: "8px", background: "rgba(255,87,36,.1)", padding: "7px 11px", fontSize: "12px", fontWeight: "500", color: "#c2380f" }}><__Icon name="circle-x" strokeWidth="1.75" width="15" height="15" />Failed after 1.8 s · HTTP 403 SignatureDoesNotMatch</span>
                          <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "#94a3b8" }}>Last successful test 17 Aug 2026, 10:41 am</span>
                        </span>
                        <span style={{ display: "block", border: "1px solid rgba(255,87,36,.35)", borderRadius: "9px", background: "#fff", padding: "12px 14px" }}>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#1e293b", paddingBottom: "6px" }}>What to check, in order</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}><b style={{ flex: "none", fontWeight: "600", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>1.</b>The endpoint above is malformed — fix that first and test again.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}><b style={{ flex: "none", fontWeight: "600", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>2.</b>Access key and secret must come from the same key pair; a rotated secret invalidates the old one.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}><b style={{ flex: "none", fontWeight: "600", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>3.</b>Bucket sellino-media-bd must live in region blr1.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}><b style={{ flex: "none", fontWeight: "600", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>4.</b>Server clock skew over 15 minutes also produces this error.</span>
                          <span style={{ display: "block", paddingTop: "6px", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "10.5px", lineHeight: "16px", color: "#64748b" }}>request-id 8f2c41ab-91d0-4e6f · 7 Sep 2026 16:11:38 +06</span>
                        </span>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Storage driver<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>1</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Credentials<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>7</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Secrets are write-only: once saved they are replaced, never revealed.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#c2380f" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(255,87,36,.14)" }}>
  <__Icon name="triangle-alert" strokeWidth="1.75" width="14" height="14" />
</span>Could not save — 2 fields need attention</span>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "rgba(255,87,36,.1)", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#c2380f", cursor: "pointer" }}>Go to first error<__Icon name="arrow-down" strokeWidth="1.75" width="13" height="13" /></button>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Nothing was saved · your edits are kept</span>
                  <button className="dc-h514" style={{ display: "inline-flex", alignItems: "center", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discard</button>
                  <button className="dc-h515" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 18px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".02em", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(0,48,135,.7)" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
