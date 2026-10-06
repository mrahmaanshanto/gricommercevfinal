'use client';
// Generated from design/templates/settings-console/SetStorage.dc.html by scripts/convert-design.mjs.
// SetStorage
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetPick as __Pick, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "storage";
  fields = {
    path_style_endpoint: {l: "Path-style endpoint", d: false},
    driver: {l: "Storage driver", d: "S3-compatible"},
    access_key_id: {l: "Access key ID", d: "DO00••••••••••P9RT", req: true},
    bucket: {l: "Bucket", d: "dazzleshop-media-bd", req: true},
    region: {l: "Region", d: "blr1", req: true},
    endpoint: {l: "Endpoint", d: "dazzleshop-media-bd.blr1.digitaloceanspaces.com/", req: true, check: (x) => (/^https:\/\/[^\s/]+$/.test(x) ? "" : (/^https?:\/\//.test(x) ? "" : "Add https:// at the start. ") + (/\/$/.test(x) ? "Remove the slash at the end. " : "") + "It should look like https://blr1.digitaloceanspaces.com")},
    public_url_cdn_base: {l: "Public URL / CDN base", d: "https://cdn.dazzleshop.com.bd", req: true, k: "url"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      testOk: this.state.test === "ok",
      test: () => {
        const bad = ["access_key_id", "bucket", "region", "endpoint", "public_url_cdn_base"].find((n) => this.check(n, f.get(n, "")));
        if (bad) {
          this.setState((st) => ({ test: "failed", errs: { ...st.errs, [bad]: this.check(bad, f.get(bad, "")) } }), () => f.focus(bad));
          toast("Connection test stopped: " + this.fields[bad].l + " needs fixing first.", { tone: "error" });
          return;
        }
        this.setState({ test: "ok" });
        toast("Connected to " + f.get("bucket", "") + ". Save to keep these settings.");
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h512:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h513:hover{background:#e9eef5 !important;color:#1e293b !important}
/* phone: the warning button sits under its text; driver cards go to one column on a narrow phone */
@media (max-width:640px){
  .set-note>button{margin-left:28px}
}
@media (max-width:420px){
  .set-shell .gc-cols-4.set-picks{grid-template-columns:minmax(0,1fr)!important}
}`;

// ---- markup ----

export default class SetStorageScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetStorage">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="Storage" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="storage" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header className="set-pagehead">
                      <span className="set-pagehead__text">
                        <h1 className="ix-head__title">Storage</h1>
                        <__SetTips />
                        <span className="gc-pagehead__about" hidden>Secrets are write-only: once saved they are replaced, never revealed.</span>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: v.testOk ? "rgba(16,185,129,.14)" : "rgba(255,87,36,.12)", color: v.testOk ? "var(--text-success)" : "var(--text-danger)" }}>{v.testOk ? "Connection tested" : "Test failed · not saved"}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>48,210 files · 61.4 GB stored</span>
                      </span>
                    </header>
                    <section id="s0" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Storage driver</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>{v.f.get("driver", "S3-compatible")}</span>
                        </span>
                      </div>
                      <div className="gc-cols-4 set-picks" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", padding: "16px" }}>
                        <__Pick f={v.f} n="driver" val="Local disk" style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Local disk</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>public/storage on the app server. Simplest, but images are lost if the server is rebuilt.</span>
                        </__Pick>
                        <__Pick f={v.f} n="driver" val="Amazon S3" style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Amazon S3</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>AWS-hosted buckets. Region and bucket only — no endpoint needed.</span>
                        </__Pick>
                        <__Pick f={v.f} n="driver" val="S3-compatible" style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 13px" }}>
                          <span className="set-flow" style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span className="set-grow" style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>S3-compatible</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>Active</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>DigitalOcean Spaces, Wasabi, MinIO, Backblaze B2. Needs a custom endpoint.</span>
                        </__Pick>
                        <__Pick f={v.f} n="driver" val="Cloudflare R2" style={{ display: "flex", flexDirection: "column", gap: "7px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <span className="set-pick__dot" aria-hidden="true" />
                            <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Cloudflare R2</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Zero egress fees. Uses an account-scoped endpoint and a token pair.</span>
                        </__Pick>
                      </div>
                      <div className="set-flow set-note" style={{ display: "flex", alignItems: "center", gap: "11px", margin: "0 18px 18px", border: "1px solid rgba(255,152,0,.4)", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.08)", padding: "11px 13px" }}>
                        <__Icon name="shield-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-warning)" }} />
                        <span className="set-grow" style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#7a4a00" }}>Changing the driver asks for confirmation. Existing files are <b style={{ fontWeight: "var(--weight-medium)" }}>not</b> migrated — 48,210 images would need to be copied first, and the storefront serves broken images until they are.</span>
                        <button type="button" onClick={v.f.say("“Plan a migration” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid var(--border-field)", background: "#fff", color: "#1e293b" }}><__Icon name="arrow-right-left" strokeWidth="1.75" width="15" height="15" />Plan a migration</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 13px" }}>
                        <__Icon name="eye-off" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hidden for this driver: <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Local disk path</b>, <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Symlink public folder</b>, <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>AWS region preset</b>.</span>
                      </div>
                    </section>
                    <section id="s1" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">S3-compatible credentials</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: v.testOk ? "rgba(16,185,129,.14)" : "rgba(255,87,36,.12)", color: v.testOk ? "var(--text-success)" : "var(--text-danger)" }}>{v.testOk ? "Connected" : "Test failed"}</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("access_key_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Access key ID <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("access_key_id") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Public half of the pair. Safe to copy into a support ticket.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="access_key_id" labelled desc />
                            <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h512" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button type="button" onClick={v.f.copy("access_key_id")} className="dc-h513" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="access_key_id" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Secret access key <span style={{ color: "var(--text-danger)" }}>*</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Saved</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Stored encrypted and never re-displayed. Replace it if you rotate the pair.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 17 Aug 2026</span>
                            <button type="button" onClick={v.f.say("“Replace” is not available in the demo yet.")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("bucket")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Bucket <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("bucket") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Must already exist. GridCommerce will not create it for you.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="bucket" labelled desc />
                          </span>
                          <__Err f={v.f} n="bucket" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("region")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Region <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("region") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>The datacentre slug, not the display name.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", width: "200px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="region" labelled desc opts={["blr1","sgp1","fra1","nyc3"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="region" />
                        </div>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("endpoint")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Endpoint <span className="set-req" aria-hidden="true">*</span></label>
                            </span>
                            <span id={v.f.id("endpoint") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Full origin for the S3 API. Scheme required, no bucket, no trailing slash.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #ff5724", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", boxShadow: "0 0 0 3px rgba(255,87,36,.12)" }}>
                              <__In f={v.f} n="endpoint" labelled desc />
                            </span>
                            <__Err f={v.f} n="endpoint" />
                          </div>
                        </span>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("public_url_cdn_base")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Public URL / CDN base <span className="set-req" aria-hidden="true">*</span></label>
                            </span>
                            <span id={v.f.id("public_url_cdn_base") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>What the storefront links to. Use the CDN hostname so images are cached at the edge.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                              <__In f={v.f} n="public_url_cdn_base" labelled desc />
                            </span>
                            <__Err f={v.f} n="public_url_cdn_base" />
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Resulting image URL: <span style={{ fontFamily: "var(--font-data)", color: "#334155" }}>{String(v.f.get("public_url_cdn_base", "")).replace(/\/+$/, "")}/products/8842/front-800.webp</span></span>
                          </div>
                        </span>
                        <span style={{ gridColumn: "1 / -1" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Path-style endpoint</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Puts the bucket in the path instead of the hostname. MinIO and older gateways need this on; DigitalOcean Spaces needs it off.</span>
                            </span>
                            <__Sw f={v.f} n="path_style_endpoint" />
                          </div>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "11px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 18px" }}>
                        <span className="set-flow" style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                          <button type="button" onClick={v.test} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid var(--border-field)", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                          {v.testOk ? (<span role="status" style={{ display: "inline-flex", alignItems: "center", gap: "7px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", padding: "7px 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="15" height="15" aria-hidden="true" />Connected in 412 ms · bucket found</span>) : (<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", padding: "7px 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)" }}><__Icon name="circle-x" strokeWidth="1.75" width="15" height="15" />Failed after 1.8 s · HTTP 403 SignatureDoesNotMatch</span>)}
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.testOk ? "Tested just now" : "Last successful test 17 Aug 2026, 10:41 AM"}</span>
                        </span>
                        {v.testOk ? null : (
                        <span style={{ display: "block", border: "1px solid rgba(255,87,36,.35)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "12px 14px" }}>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", paddingBottom: "6px" }}>What to check, in order</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}><b style={{ flex: "none", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>1.</b>The endpoint above is malformed — fix that first and test again.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}><b style={{ flex: "none", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>2.</b>Access key and secret must come from the same key pair; a rotated secret invalidates the old one.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}><b style={{ flex: "none", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>3.</b>Bucket dazzleshop-media-bd must live in region blr1.</span>
                          <span style={{ display: "flex", gap: "9px", padding: "3px 0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}><b style={{ flex: "none", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>4.</b>Server clock skew over 15 minutes also produces this error.</span>
                          <span style={{ display: "block", paddingTop: "6px", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>request-id 8f2c41ab-91d0-4e6f · 7 Sep 2026 16:11:38 +06</span>
                        </span>
                        )}
                      </div>
                    </section>
                  </main>
                </div>
                <__SaveBar f={v.f} note="· 17 Aug 2026" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
