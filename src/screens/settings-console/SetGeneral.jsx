'use client';
// Generated from design/templates/settings-console/SetGeneral.dc.html by scripts/convert-design.mjs.
// SetGeneral
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSeg as __Seg, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "general";
  fields = {
    store_name: {l: "Store name", d: "GridShop", req: true},
    copyright_line: {l: "Copyright line", d: "© 2026 GridShop. All rights reserved. Trade licence 1043/FEN-2021.", req: true, k: "area"},
    footer_about: {l: "Footer about", check: (x) => (x.length > 400 ? "Keep the footer text to 400 characters or fewer. It is " + x.length + " now." : ""), d: "GridShop is a multi-warehouse commerce platform for Bangladeshi retailers — one catalogue, one stock ledger and one register across every branch. Shop online or visit us in Feni, Gulshan and Chattogram.", k: "area"},
    currency: {l: "Currency", d: "Bangladeshi Taka — ৳ (BDT)", req: true},
    default_country: {l: "Default country", d: "Bangladesh", req: true},
    timezone: {l: "Timezone", d: "(UTC+06:00) Asia/Dhaka", req: true},
    date_format: {l: "Date format", d: "Mon D, YYYY", req: true},
    time_format: {l: "Time format", d: "12-hour"},
    rows_per_page: {l: "Rows per page", d: "25", k: "int", req: true, check: (x) => (+x < 5 || +x > 200 ? "Choose between 5 and 200 rows per page." : "")},
    support_phone: {l: "Support phone", d: "+8801811843300", req: true, k: "tel"},
    support_email: {l: "Support email", d: "info@bugbuild.com", req: true, k: "email"},
    working_hours_text: {l: "Working hours text", d: "Sat–Thu, 10:00 AM – 8:00 PM"},
    store_address: {l: "Store address", d: "4th floor, Feni Center, Feni-3900, Bangladesh", req: true},
    support_line_hours: {l: "Support line hours", d: "09:00", k: "time"},
    support_line_hours_to: {l: "Support line hours (to)", d: "22:00", k: "time"},
    service_window: {l: "Service window", d: "10:00", k: "time"},
    service_window_to: {l: "Service window (to)", d: "20:00", k: "time"},
    map_embed: {l: "Google Maps embed code", k: "area", d: "<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.62!2d91.3976!3d23.0159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1\" width=\"100%\" height=\"360\" loading=\"lazy\"></iframe>", check: (x) => (/^<iframe[^>]+src="https:\/\/www\.google\.com\/maps\/embed[^"]*"[^>]*><\/iframe>$/.test(x) ? "" : "Paste the whole <iframe> code from Google Maps → Share → Embed a map.")},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      step: (by) => () => f.set("rows_per_page", String(Math.min(200, Math.max(5, (parseInt(f.get("rows_per_page", "25"), 10) || 25) + by)))),
      mapOk: /^<iframe[^>]+src="https:\/\/www\.google\.com\/maps\/embed[^"]*"[^>]*><\/iframe>$/.test(String(f.get("map_embed", "")).trim()),
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h434:hover{background:#f8fafc !important}
.dc-h435:hover{color:#1e293b !important}
.dc-h436:hover{color:#1e293b !important}
.dc-h437:hover{color:#1e293b !important}
.dc-h438:hover{color:#1e293b !important}`;

// ---- markup ----

export default class SetGeneralScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetGeneral">
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
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>General</h1>
                        <p style={{ margin: "0", maxWidth: "620px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>Store identity, formats and contact details. These values appear on the storefront, on invoices, on POS receipts and in every outgoing message. Fields marked <span style={{ color: "var(--text-danger)" }}>*</span> are required.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Configured · 26 settings</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last saved 7 Sep 2026, 3:12 PM</span>
                      </span>
                    </header>
                    <section id="identity" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Store identity</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>The name and legal text shown to customers.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>3 settings</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("store_name")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Store name <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("store_name") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Used in the browser title, invoice header, receipt header and the sender name on emails.</span>
                          <div className="set-box" style={{ display: "flex", alignItems: "center", height: "44px", maxWidth: "420px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="store_name" labelled desc /></div>
                          <__Err f={v.f} n="store_name" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("copyright_line")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Copyright line <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("copyright_line") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Sits in the storefront footer. Plain text — no HTML.</span>
                          <div className="set-box" style={{ border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "9px 11px", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#1e293b" }}><__In f={v.f} n="copyright_line" labelled desc rows={2} /></div>
                          <__Err f={v.f} n="copyright_line" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label htmlFor={v.f.id("footer_about")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Footer about</label>
                            <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{String(v.f.get("footer_about", "")).length} / 400</span>
                          </span>
                          <span id={v.f.id("footer_about") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Short description under the logo in the storefront footer. Two or three sentences reads best.</span>
                          <div className="set-box" style={{ border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "9px 11px", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#1e293b" }}><__In f={v.f} n="footer_about" labelled desc rows={3} /></div>
                          <__Err f={v.f} n="footer_about" />
                        </div>
                      </div>
                    </section>
                    <section id="formats" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>{"Formats & locale"}</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Every format shows a live sample of what it produces.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>6 settings</span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("currency")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Currency <span className="set-req" aria-hidden="true">*</span></label>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}><__Icon name="shield-alert" strokeWidth="1.75" width="12" height="12" />Confirm to change</span>
                          </span>
                          <span id={v.f.id("currency") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Sets the symbol and decimal rule everywhere. Prices already stored are <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>not</b> converted.</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="set-box" style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="currency" labelled desc opts={["Bangladeshi Taka — ৳ (BDT)","US Dollar — $ (USD)","Indian Rupee — ₹ (INR)"]} /><__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "var(--text-muted)" }} /></span>
                            <__Err f={v.f} n="currency" />
                          </div>
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Preview<b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("default_country")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Default country <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("default_country") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Pre-selected on checkout, seller onboarding and address forms.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="default_country" labelled desc opts={["Bangladesh","India","Nepal","Sri Lanka"]} /><__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "var(--text-muted)" }} /></span>
                          <__Err f={v.f} n="default_country" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("timezone")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Timezone <span className="set-req" aria-hidden="true">*</span></label>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}><__Icon name="shield-alert" strokeWidth="1.75" width="12" height="12" />Confirm to change</span>
                          </span>
                          <span id={v.f.id("timezone") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Stamps orders, reports and register shifts. Changing it re-labels historical timestamps.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="timezone" labelled desc opts={["(UTC+06:00) Asia/Dhaka","(UTC+05:30) Asia/Kolkata","(UTC+00:00) UTC"]} /><__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "var(--text-muted)" }} /></span>
                          <__Err f={v.f} n="timezone" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Now<b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>4:14 PM · 7 Sep 2026</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("date_format")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Date format <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("date_format") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Applies to admin tables, invoices and customer-facing dates.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="date_format" labelled desc opts={["Mon D, YYYY","D Mon YYYY","DD/MM/YYYY","YYYY-MM-DD"]} /><__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "var(--text-muted)" }} /></span>
                          <__Err f={v.f} n="date_format" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Preview<b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>Sep 7, 2026</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Time format <span style={{ color: "var(--text-danger)" }}>*</span></span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Bangla staff commonly read 12-hour time; reports stay 24-hour regardless.</span>
                          <__Seg f={v.f} n="time_format" opts={["12-hour", "24-hour"]} />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Preview<b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{v.f.get("time_format", "12-hour") === "24-hour" ? "16:14" : "4:14 PM"}</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("rows_per_page")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rows per page <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("rows_per_page") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>How many records every admin table loads at once. Above 100 slows reports on large catalogues.</span>
                          <span className="set-box" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", height: "48px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__In f={v.f} n="rows_per_page" labelled desc style={{ padding: "0 11px" }} />
                            <span style={{ display: "flex", flexDirection: "column", flex: "none", width: "32px", height: "100%", borderLeft: "1px solid #e2e8f0" }}>
                              <button type="button" aria-label="Show 5 more rows per page" onClick={v.step(5)} style={{ flex: "1", display: "grid", placeItems: "center", border: "none", borderBottom: "1px solid #e2e8f0", background: "none", padding: "0", color: "var(--text-muted)", cursor: "pointer" }}>
                                <__Icon name="chevron-up" strokeWidth="1.75" width="13" height="13" aria-hidden="true" />
                              </button>
                              <button type="button" aria-label="Show 5 fewer rows per page" onClick={v.step(-5)} style={{ flex: "1", display: "grid", placeItems: "center", border: "none", background: "none", padding: "0", color: "var(--text-muted)", cursor: "pointer" }}>
                                <__Icon name="chevron-down" strokeWidth="1.75" width="13" height="13" aria-hidden="true" />
                              </button>
                            </span>
                          </span>
                          <__Err f={v.f} n="rows_per_page" />
                        </div>
                      </div>
                    </section>
                    <section id="assets" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Brand assets</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Eight images used across storefront, invoices and receipts. Each tile states its own size and format.</span>
                        </span>
                        <__Link href="/set-media" className="dc-h434" style={{ marginLeft: "auto", flex: "none", display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", height: "36px", textDecoration: "none" }}>Manage all 8<__Icon name="arrow-up-right" strokeWidth="1.75" width="15" height="15" /></__Link>
                      </div>
                      <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "repeating-linear-gradient(135deg,#f8fafc 0 6px,#f1f5f9 6px 12px)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#003087", fontSize: "var(--text-xs)", color: "#fff" }}>S</span>GridShop</span>
                          </span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Light theme logo</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>SVG or PNG · 320×80</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #26334d", borderRadius: "var(--radius-lg)", background: "#192132" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#66c4eb" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-md)", background: "#009cde", fontSize: "var(--text-xs)", color: "#0b1524" }}>S</span>GridShop</span>
                          </span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Dark theme logo</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>SVG or PNG · 320×80</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "grid", placeItems: "center", height: "74px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#003087", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff" }}>S</span>
                          </span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Favicon</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>PNG · 64×64</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", height: "74px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f8fafc", color: "var(--text-muted)" }}>
                            <__Icon name="image-plus" strokeWidth="1.75" width="18" height="18" />
                            <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)" }}>fallback image</span>
                          </span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Fallback image</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-warning)" }}>Not set · 600×600</span>
                        </div>
                      </div>
                    </section>
                    <section id="support" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Support information</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Published in the footer, on invoices and in the storefront help widget.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8 settings</span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("support_phone")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Support phone <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("support_phone") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Shown as a tap-to-call link on mobile. Include the country code.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="phone" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="support_phone" labelled desc /></span>
                          <__Err f={v.f} n="support_phone" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("support_email")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Support email <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("support_email") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Receives contact-form messages and appears as the reply-to on order mail.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__Icon name="mail" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="support_email" labelled desc /></span>
                          <__Err f={v.f} n="support_email" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("working_hours_text")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Working hours text</label>
                          <span id={v.f.id("working_hours_text") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Free text shown to customers — write it the way you would say it.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="working_hours_text" labelled desc /></span>
                          <__Err f={v.f} n="working_hours_text" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("store_address")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Store address <span className="set-req" aria-hidden="true">*</span></label>
                          <span id={v.f.id("store_address") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Printed on invoices and used as the return address for courier pickups.</span>
                          <div className="set-box" style={{ display: "flex", alignItems: "center", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", lineHeight: "19px", color: "#1e293b" }}><__In f={v.f} n="store_address" labelled desc /></div>
                          <__Err f={v.f} n="store_address" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("support_line_hours")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Support line hours</label>
                          <span id={v.f.id("support_line_hours") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>When the phone line is staffed. Outside these hours the widget offers the AI reply instead.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="set-box" style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="support_line_hours" labelled desc /></span>
                            <__Err f={v.f} n="support_line_hours" />
                            <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>to</span>
                            <span className="set-box" style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="support_line_hours_to" /></span>
                            <__Err f={v.f} n="support_line_hours_to" />
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("service_window")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Service window</label>
                          <span id={v.f.id("service_window") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Hours in which delivery slots can be booked by customers.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="set-box" style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="service_window" labelled desc /></span>
                            <__Err f={v.f} n="service_window" />
                            <span style={{ flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>to</span>
                            <span className="set-box" style={{ flex: "1", display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__Icon name="clock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} /><__In f={v.f} n="service_window_to" /></span>
                            <__Err f={v.f} n="service_window_to" />
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="location" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Store location</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>The map embedded on the contact page.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1 setting</span>
                      </div>
                      <div className="set-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label htmlFor={v.f.id("map_embed")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Google Maps embed code</label>
                          <span id={v.f.id("map_embed") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Google Maps → Share → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Embed a map</b> → copy the whole <span style={{ fontFamily: "var(--font-data)" }}>{"<iframe>"}</span>. Pasted code is sanitised before it is stored.</span>
                          <div className="set-box" style={{ border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "9px 11px", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", lineHeight: "18px", color: "#334155", wordBreak: "break-all" }}><__In f={v.f} n="map_embed" labelled desc rows={5} spellCheck={false} /></div>
                          <__Err f={v.f} n="map_embed" />
                          {v.mapOk ? (<span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Valid embed · resolves to Feni Center, Feni</span>) : null}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Preview</span>
                          <span style={{ display: "grid", placeItems: "center", height: "130px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "repeating-linear-gradient(135deg,#f8fafc 0 8px,#f1f5f9 8px 16px)", color: "var(--text-muted)" }}>
                            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                              <__Icon name="map-pin" strokeWidth="1.75" width="20" height="20" style={{ color: "#003087" }} />
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs)" }}>map preview · 23.0159, 91.3976</span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#identity" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Store identity<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>3</span></a>
                      <a className="dc-h435" href="#formats" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>{"Formats & locale"}<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>6</span></a>
                      <a className="dc-h436" href="#assets" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Brand assets<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8</span></a>
                      <a className="dc-h437" href="#support" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Support info<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8</span></a>
                      <a className="dc-h438" href="#location" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Store location<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Changes to currency, timezone and storage driver ask for confirmation before they save.</span>
                  </aside>
                </div>
                <__SaveBar f={v.f} note="· 3:12 PM by Ashiq Khan" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
