'use client';
// Generated from design/templates/settings-console/SetPreference.dc.html by scripts/convert-design.mjs.
// SetPreference
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetSeg as __Seg, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "preference";
  fields = {
    two_factor_otp_on_admin_login: {l: "Two-factor OTP on admin login", d: true},
    send_otp_by_email: {l: "Send OTP by email", d: true},
    send_otp_by_sms: {l: "Send OTP by SMS", d: true},
    secure_delivery_otp: {l: "Secure delivery OTP", d: true},
    send_order_notification_emails: {l: "Send order notification emails", d: true},
    processing: {l: "Processing", d: true},
    to_be_shipped: {l: "To be shipped", d: true},
    shipped: {l: "Shipped", d: true},
    cancelled: {l: "Cancelled", d: true},
    products_need_approval: {l: "Products need approval", d: true},
    brands_need_approval: {l: "Brands need approval", d: true},
    categories_need_approval: {l: "Categories need approval", d: true},
    attributes_need_approval: {l: "Attributes need approval", d: false},
    attribute_values_need_approval: {l: "Attribute values need approval", d: false},
    sellers_may_add_their_own_delivery_men: {l: "Sellers may add their own delivery men", d: true},
    recently_viewed_products: {l: "Recently viewed products", d: true},
    applies_to: {l: "Applies to", d: "Platform orders only"},
    customer_id_prefix: {l: "Customer ID prefix", d: "SLC-", req: true},
    seller_id_prefix: {l: "Seller ID prefix", d: "SLS-", req: true},
    admin_id_prefix: {l: "Admin ID prefix", d: "SLA-", req: true},
    order_code_prefix: {l: "Order code prefix", d: "ORD-", req: true},
    otp_length: {l: "OTP length", d: "6", k: "int", req: true, check: (x) => (+x < 4 || +x > 8 ? "Choose an OTP length from 4 to 8 digits." : "")},
    otp_validity: {l: "OTP validity", d: "5 minutes"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      otpSample: "41802375".slice(0, Math.min(8, Math.max(4, parseInt(f.get("otp_length", "6"), 10) || 6))).replace(/(\d{3,4})(?=\d{3,4}$)/, "$1 "),
      mailOn: ["processing", "to_be_shipped", "shipped", "cancelled"].filter((n) => f.get(n, true)).length,
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h460:hover{background:#e9eef5 !important;color:#1e293b !important}`;

// ---- markup ----

export default class SetPreferenceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetPreference">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="Preference" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="preference" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Preference</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>Identifiers, login security, OTP delivery, order mail and what sellers may publish on their own. Around twenty switches — each one says what it does and what it costs you.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Configured · 22 settings</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Saved a moment ago</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Identifiers</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Prefixes are prepended to generated codes. Existing records keep the ID they were created with.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>4 settings</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("customer_id_prefix")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Customer ID prefix <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("customer_id_prefix") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Shown on the membership card and in the POS customer search.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="customer_id_prefix" labelled desc /></span>
                          <__Err f={v.f} n="customer_id_prefix" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Next ID<b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.f.get("customer_id_prefix", "SLC-")}004182</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("seller_id_prefix")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Seller ID prefix <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("seller_id_prefix") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Used in seller payouts and commission statements.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="seller_id_prefix" labelled desc /></span>
                          <__Err f={v.f} n="seller_id_prefix" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Next ID<b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.f.get("seller_id_prefix", "SLS-")}000246</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("admin_id_prefix")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Admin ID prefix <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("admin_id_prefix") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Appears in the staff directory and audit log.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="admin_id_prefix" labelled desc /></span>
                          <__Err f={v.f} n="admin_id_prefix" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Next ID<b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.f.get("admin_id_prefix", "SLA-")}000031</b></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("order_code_prefix")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Order code prefix <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("order_code_prefix") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Order codes combine the prefix, the order date and a daily counter.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}><__In f={v.f} n="order_code_prefix" labelled desc /></span>
                          <__Err f={v.f} n="order_code_prefix" />
                          <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Next ID<b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.f.get("order_code_prefix", "ORD-")}20260907-0001</b></span>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Security</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Applies to every admin and seller account on this store.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>7 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Two-factor OTP on admin login<span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "19px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>Recommended</span></span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>After the password, admins enter a one-time code. Strongly recommended — an admin session can refund orders and export customer data.</span>
                          </span>
                          <__Sw f={v.f} n="two_factor_otp_on_admin_login" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Send OTP by email</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Delivered through the Mail tab settings. Free, but slower on some Bangladeshi providers.</span>
                          </span>
                          <__Sw f={v.f} n="send_otp_by_email" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Send OTP by SMS</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Delivered through MIM SMS. Each code costs roughly ৳0.35.</span>
                          </span>
                          <__Sw f={v.f} n="send_otp_by_sms" />
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", borderTop: "1px solid #f1f5f9", padding: "14px 0 4px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("otp_length")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OTP length</label>
                            </span>
                            <span id={v.f.id("otp_length") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Six digits is the norm in Bangladesh. Four is easier to type; eight is harder to guess.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "132px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__In f={v.f} n="otp_length" labelled desc /></span>
                            <__Err f={v.f} n="otp_length" />
                            <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "7px", height: "26px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sample<b style={{ fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b", letterSpacing: "var(--tracking-label)" }}>{v.otpSample}</b></span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("otp_validity")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OTP validity</label>
                            </span>
                            <span id={v.f.id("otp_validity") + "-help"} style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Minutes before the code expires and a new one must be requested.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", width: "160px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}><__In f={v.f} n="otp_validity" labelled desc opts={["2 minutes","5 minutes","10 minutes","15 minutes"]} /><__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ marginLeft: "auto", color: "var(--text-muted)" }} /></span>
                            <__Err f={v.f} n="otp_validity" />
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Secure delivery OTP</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>The delivery man must enter a code from the customer before an order is marked delivered. Cuts “never received” disputes.</span>
                          </span>
                          <__Sw f={v.f} n="secure_delivery_otp" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 0 12px 0" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Applies to</span>
                          <__Seg f={v.f} n="applies_to" opts={["Platform orders only","All sellers"]} />
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Turning this on for all sellers notifies 246 sellers by email.</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Order notification emails</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Master switch first; per-status mail can then be tuned. Customers always receive the order-placed receipt.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>{v.mailOn} of 4 on</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Send order notification emails</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>When off, no status mail is sent at all and the four switches below are ignored.</span>
                          </span>
                          <__Sw f={v.f} n="send_order_notification_emails" />
                        </div>
                        <div style={{ marginTop: "8px", borderLeft: "2px solid #e2e8f0", paddingLeft: "14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Processing</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Sent when the warehouse accepts the order. “আপনার অর্ডার প্রস্তুত হচ্ছে”</span>
                            </span>
                            <__Sw f={v.f} n="processing" />
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>To be shipped</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Sent when the order is packed and waiting for pickup.</span>
                            </span>
                            <__Sw f={v.f} n="to_be_shipped" />
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Shipped</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Includes the courier name and the tracking code from Pathao or Steadfast.</span>
                            </span>
                            <__Sw f={v.f} n="shipped" />
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Cancelled</span>
                              <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Sent on cancellation with the refund route and expected timing.</span>
                            </span>
                            <__Sw f={v.f} n="cancelled" />
                          </div>
                        </div>
                      </div>
                    </section>
                    <section id="s3" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Seller approvals</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{"What a seller may publish without a review from your team. Approvals queue under Customers & Sellers."}</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>6 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Products need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>246 sellers · 38 products waiting. Off means seller products go live immediately.</span>
                          </span>
                          <__Sw f={v.f} n="products_need_approval" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Brands need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Prevents duplicate and misspelled brand records in the catalogue.</span>
                          </span>
                          <__Sw f={v.f} n="brands_need_approval" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Categories need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Sellers may request a category; your team places it in the tree.</span>
                          </span>
                          <__Sw f={v.f} n="categories_need_approval" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Attributes need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Keeps the filter set on the storefront clean.</span>
                          </span>
                          <__Sw f={v.f} n="attributes_need_approval" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Attribute values need approval</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Values like “XL” or “Matte black” added by sellers.</span>
                          </span>
                          <__Sw f={v.f} n="attribute_values_need_approval" />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Sellers may add their own delivery men</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Seller-managed riders can accept secure-delivery OTPs for that seller’s own orders only.</span>
                          </span>
                          <__Sw f={v.f} n="sellers_may_add_their_own_delivery_men" />
                        </div>
                      </div>
                    </section>
                    <section id="s4" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Discovery</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Small storefront behaviours.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1 setting</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", padding: "6px 18px 12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Recently viewed products</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Keeps the last 12 products a customer opened, stored in their browser for 30 days.</span>
                          </span>
                          <__Sw f={v.f} n="recently_viewed_products" />
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Identifiers<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>4</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Security<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>7</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Order emails<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>5</span></a>
                      <a href="#s3" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Seller approvals<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>6</span></a>
                      <a href="#s4" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Discovery<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>1</span></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Nothing is applied until you choose Save changes.</span>
                  </aside>
                </div>
                <__SaveBar f={v.f} note="· a moment ago" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
