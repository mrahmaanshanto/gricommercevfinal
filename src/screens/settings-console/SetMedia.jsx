'use client';
// Generated from design/templates/settings-console/SetMedia.dc.html by scripts/convert-design.mjs.
// SetMedia
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetSeg as __Seg, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "media";
  savedMessage = 'Brand assets saved';
  fileRef = React.createRef();
  target = '';
  limits = { light: 500, dark: 500, favicon: 100, fallback: 500, payment: 500, delivery: 500, verified: 100, licences: 500 };
  fields = {
    asset_light: {l: "Light theme logo", d: "gridshop-logo-light.svg · 24KB"},
    asset_dark: {l: "Dark theme logo", d: "gridshop-logo-dark.svg · 25KB"},
    asset_favicon: {l: "Favicon", d: "favicon-64.png · 6KB"},
    asset_fallback: {l: "Fallback image", d: ""},
    asset_payment: {l: "Payment gateway image", d: "payments-strip.png · 184KB"},
    asset_delivery: {l: "Delivery partner image", d: "couriers-strip.png · 156KB"},
    asset_verified: {l: "Verified badge image", d: "verified-badge.svg · 4KB"},
    asset_licences: {l: "Licences image", d: "trade-licence-2026.jpg · 1.8MB"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      dark: (this.state.theme || "Dark") === "Dark",
      themeF: { def: () => ({ l: "Preview background" }), get: () => this.state.theme || "Dark", set: (n, val) => this.setState({ theme: val }) },
      fileRef: this.fileRef,
      asset: (id, empty) => f.get("asset_" + id, "") || empty,
      // "" means no tile was chosen: the file goes to the first tile that has nothing set
      pick: (id) => () => { this.target = id; if (this.fileRef.current) { this.fileRef.current.value = ""; this.fileRef.current.click(); } },
      remove: (id) => () => { f.set("asset_" + id, ""); toast(this.fields["asset_" + id].l + " removed. Save to apply.", { tone: "info" }); },
      onFile: (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const id = this.target || Object.keys(this.limits).find((k) => !f.get("asset_" + k, "")) || "fallback";
        const kb = Math.max(1, Math.round(file.size / 1024));
        if (kb > this.limits[id]) { toast(file.name + " is " + (kb >= 1024 ? (kb / 1024).toFixed(1) + "MB" : kb + "KB") + ". The limit for the " + this.fields["asset_" + id].l.toLowerCase() + " is " + this.limits[id] + "KB.", { tone: "error" }); return; }
        f.set("asset_" + id, file.name + " · " + kb + "KB");
        toast(this.fields["asset_" + id].l + " is ready. Save to publish it.", { tone: "info" });
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h439:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h440:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h441:hover{background:#002a77 !important}
/* phone: a tile's status chip drops under its title, its buttons wrap; below 480px each tile is one row
   (preview on the left, details on the right) */
@media (max-width:640px){
  .set-tiles>div>div:last-child>span:first-child{flex-wrap:wrap;row-gap:4px}
  .set-tiles>div>div:last-child>span:first-child>span:first-child{flex:1 1 auto!important}
  .set-tiles>div>div:last-child>span:last-child{flex-wrap:wrap}
  .set-drop{flex-wrap:wrap}
  .set-drop>span:nth-child(2){flex:1 1 200px!important}
  .set-drop>button{flex:1 1 100%;justify-content:center}
  /* tile buttons (Replace, Add image, Cancel, Try another file) are a comfortable 36px to tap;
     Remove gets the same height and a light outline so it reads as a button, not a bare word */
  .set-tiles>div>div:last-child>span:last-child>button{height:36px!important;padding:0 12px!important;border-radius:var(--radius-lg)!important}
  .set-tiles>div>div:last-child>span:last-child>button[aria-label^="Remove"]{border:1px solid rgba(194,65,12,.3)!important;background:#fff!important}
}
@media (max-width:480px){
  .set-shell .gc-cols-4.set-tiles{grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
  .set-tiles>div{flex-direction:row!important}
  .set-tiles>div>div:first-child{flex:none;width:112px;height:auto!important;min-height:104px;padding:8px;border-bottom:0!important;border-right:1px solid #e2e8f0}
  .set-tiles>div>div:first-child>span{flex-wrap:wrap;justify-content:center;max-width:100%;text-align:center}
  .set-tiles>div>div:last-child{flex:1;min-width:0}
}`;

// ---- markup ----

export default class SetMediaScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetMedia">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="General" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="general" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Brand assets</h1>
                        <__SetTips />
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />6 of 8 set · 1 uploading · 1 rejected</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>General / Brand assets</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Manage logos</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <__Seg f={v.themeF} n="preview_theme" opts={[{ v: "Light", icon: "sun" }, { v: "Dark", icon: "moon" }]} />
                          <button type="button" onClick={v.pick("")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="upload" strokeWidth="1.75" width="15" height="15" />Upload all</button>
                        </span>
                      </div>
                      <div className="gc-cols-4 set-tiles" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#003087", fontSize: "var(--text-xs)", color: "#fff" }}>S</span>GridShop</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Light theme logo</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Low contrast here</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>SVG or PNG · 320×80 · max 500KB<br />{v.asset("light", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Replace the light theme logo" onClick={v.pick("light")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button type="button" aria-label="Remove the light theme logo" onClick={v.remove("light")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: v.dark ? "#66c4eb" : "#003087" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "var(--accent-fill)", fontSize: "var(--text-xs)", color: "#fff" }}>S</span>GridShop</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Dark theme logo</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>SVG or PNG · 320×80 · max 500KB<br />{v.asset("dark", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Replace the dark theme logo" onClick={v.pick("dark")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button type="button" aria-label="Remove the dark theme logo" onClick={v.remove("dark")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#003087", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>S</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Favicon</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>PNG · 64×64 · max 100KB<br />{v.asset("favicon", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Replace the favicon" onClick={v.pick("favicon")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button type="button" aria-label="Remove the favicon" onClick={v.remove("favicon")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                              <__Icon name="image-plus" strokeWidth="1.75" width="20" height="20" />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)" }}>drop image or browse</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Fallback image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>JPG or PNG · 600×600 · max 500KB<br />{v.asset("fallback", "used when a product has no photo")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Add the fallback image" onClick={v.pick("fallback")} style={{ height: "28px", border: "1px solid #003087", borderRadius: "var(--radius-md)", background: "rgba(0,48,135,.08)", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer" }}>Add image</button>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-warning)" }}>{v.f.get("asset_fallback", "") ? "Ready to save" : "Not set"}</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80%" }}>
                              <span style={{ fontSize: "var(--text-xs)", color: v.dark ? "#c2c9d6" : "#334155" }}>Uploading… 68%</span>
                              <span style={{ display: "block", width: "100%", height: "5px", borderRadius: "var(--radius-full)", background: v.dark ? "rgba(255,255,255,.16)" : "rgba(15,23,42,.12)", overflow: "hidden" }}>
                                <span style={{ display: "block", width: "68%", height: "100%", borderRadius: "var(--radius-full)", background: "#009cde" }} />
                              </span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Payment gateway image</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "var(--radius-full)", background: "rgba(0,156,222,.16)", padding: "0 7px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>Uploading</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>PNG · 640×120 · max 500KB<br />{v.asset("payment", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Cancel the upload of the payment gateway image" onClick={v.remove("payment")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Cancel</button>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>125KB / 184KB</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: v.dark ? "rgba(255,255,255,.1)" : "rgba(15,23,42,.08)", padding: "0 8px", fontSize: "var(--text-2xs)", color: v.dark ? "#e7e9ef" : "#334155" }}>Pathao</span>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: v.dark ? "rgba(255,255,255,.1)" : "rgba(15,23,42,.08)", padding: "0 8px", fontSize: "var(--text-2xs)", color: v.dark ? "#e7e9ef" : "#334155" }}>Steadfast</span>
                              <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: v.dark ? "rgba(255,255,255,.1)" : "rgba(15,23,42,.08)", padding: "0 8px", fontSize: "var(--text-2xs)", color: v.dark ? "#e7e9ef" : "#334155" }}>RedX</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Delivery partner image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>PNG · 640×120 · max 500KB<br />{v.asset("delivery", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Replace the delivery partner image" onClick={v.pick("delivery")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button type="button" aria-label="Remove the delivery partner image" onClick={v.remove("delivery")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.2)", color: "var(--text-success)" }}>
                              <__Icon name="badge-check" strokeWidth="1.75" width="20" height="20" />
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Verified badge image</span>
                              <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>SVG or PNG · 96×96 · max 100KB<br />{v.asset("verified", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Replace the verified badge image" onClick={v.pick("verified")} style={{ height: "28px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }}>Replace</button>
                              <button type="button" aria-label="Remove the verified badge image" onClick={v.remove("verified")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Remove</button>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                          <div className={v.dark ? "gc-on-dark" : undefined} style={{ height: "104px", display: "grid", placeItems: "center", borderBottom: "1px solid #e2e8f0", background: v.dark ? "#192132" : "#f1f5f9" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--text-danger)" }}>
                              <__Icon name="file-warning" strokeWidth="1.75" width="20" height="20" />
                              <span style={{ fontSize: "var(--text-2xs)", color: v.dark ? "#ffb4a0" : "var(--text-danger)" }}>File is 1.8MB — limit is 500KB</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "11px 12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Licences image</span>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.14)", padding: "0 7px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)" }}>Too large</span>
                            </span>
                            <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)", lineHeight: "15px", color: "var(--text-muted)" }}>JPG or PNG · 800×600 · max 500KB<br />{v.asset("licences", "No file chosen")}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "2px" }}>
                              <button type="button" aria-label="Choose another file for the licences image" onClick={v.pick("licences")} style={{ height: "28px", border: "1px solid rgba(255,87,36,.45)", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer" }}>Try another file</button>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>or compress it</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="set-drop" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 18px 18px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "13px 15px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#003087", boxShadow: "0 1px 3px 0 rgba(48,46,56,.1)" }}>
                          <__Icon name="upload-cloud" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Drag files onto any tile, or drop them here</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>SVG, PNG, JPG and WebP up to 500KB each. Images are optimised and served from the storage driver set in Platform → Storage.</span>
                        </span>
                        <button type="button" onClick={v.pick("")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b" }}><__Icon name="folder-open" strokeWidth="1.75" width="15" height="15" />Browse files</button>
                        <input ref={v.fileRef} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={v.onFile} />
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Where each asset appears</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }} />
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 22px", padding: "16px 18px" }}>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Light / dark logo</b>
                          <span style={{ color: "var(--text-muted)" }}>Storefront header, admin sidebar, invoice header, POS receipt</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Favicon</b>
                          <span style={{ color: "var(--text-muted)" }}>Browser tab, bookmark, PWA icon</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Fallback image</b>
                          <span style={{ color: "var(--text-muted)" }}>Product cards and search results with no photo</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Payment gateway image</b>
                          <span style={{ color: "var(--text-muted)" }}>Checkout footer trust strip</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Delivery partner image</b>
                          <span style={{ color: "var(--text-muted)" }}>Shipping step and order tracking page</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Verified badge</b>
                          <span style={{ color: "var(--text-muted)" }}>Seller profile and product detail page</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Licences image</b>
                          <span style={{ color: "var(--text-muted)" }}>Footer legal page and seller verification</span>
                        </span>
                        <span style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs)", lineHeight: "17px" }}>
                          <b style={{ flex: "none", width: "150px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OG image (SEO tab)</b>
                          <span style={{ color: "var(--text-muted)" }}>Link previews in Messenger, WhatsApp and Facebook</span>
                        </span>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Manage logos<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>8</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Where used<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>8</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Tiles keep a fixed aspect so a wrong-size upload is obvious before you save.</span>
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
