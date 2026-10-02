'use client';
// Generated from design/templates/settings-console/SetPayments.dc.html by scripts/convert-design.mjs.
// SetPayments
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import { PaymentLogo } from '@/components/PaymentLogo';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetSeg as __Seg, SetChk as __Chk, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';
import { GatewayList } from '@/components/GatewaySetup';

// ---- logic (from the design's <script type="text/x-dc">) ----

const ONLINE = ["sslcommerz", "eps", "nagad", "bkash", "stripe", "paypal"];
const GATEWAY_ID = { SSLCommerz: "sslcommerz", EPS: "eps", Nagad: "nagad", Stripe: "stripe", PayPal: "paypal" };

/** What opens under a gateway row: its mode and the two credentials it needs. */
function GatewayPanel({ f, name }) {
  const id = GATEWAY_ID[name];
  if (!id) return <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>{name} needs no credentials. Customers pay the courier in cash, and the money arrives with your courier payout.</span>;
  const on = !!f.get(id, false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Mode</span>
        <__Seg f={f} n={id + "_mode"} opts={["Sandbox", "Live"]} tone="warn" />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sandbox takes test payments only. Live charges real customers.</span>
      </div>
      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px 20px" }}>
        {[id + "_id", id + "_secret"].map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor={f.id(n)} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{f.def(n).l}{on ? <> <span className="set-req" aria-hidden="true">*</span></> : null}</label>
            <span className="set-box" style={{ display: "flex", alignItems: "center", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", color: "#1e293b" }}>
              <__In f={f} n={n} labelled placeholder={on ? "Required while " + name + " is on" : "Not set"} />
            </span>
            <__Err f={f} n={n} />
          </div>
        ))}
      </div>
    </div>
  );
}

class Component extends __SettingsLogic {
  formId = "payments";
  fields = {
    cash_on_delivery: {l: "Cash on delivery", d: true},
    sslcommerz: {l: "SSLCommerz", d: true},
    eps: {l: "EPS", d: true},
    nagad: {l: "Nagad", d: true},
    bkash: {l: "bKash", d: true},
    force_full_payment: {l: "Force full payment", d: false},
    payment_discount: {l: "Payment discount", d: false},
    stripe: {l: "Stripe", d: false},
    paypal: {l: "PayPal", d: false},
    bkash_send_money: {l: "bKash send money", d: true},
    rocket_send_money: {l: "Rocket send money", d: false},
    bank_transfer: {l: "Bank transfer", d: true},
    bkash_mode: {l: "bKash mode", d: "Live"},
    bkash_app_key: {l: "App key", d: "••••••••••••4c9f", req: true},
    bkash_username: {l: "Username", d: "GridShop_bd", req: true},
    bkash_password: {l: "Password", d: "••••••••••", req: true},
    bkash_merchant_number: {l: "Merchant number", d: "01811-843300"},
    bkash_checkout_label: {l: "Checkout label", d: "bKash — pay from app or wallet"},
    priority: {l: "Priority", d: "100", k: "int", req: true},
    min_order_amount: {l: "Min order amount", d: "", k: "num"},
    max_order_amount: {l: "Max order amount", d: "25,000.00", k: "num"},
    fixed_advance_amount: {l: "Fixed advance amount", d: "৳0.00"},
    advance_percentage: {l: "Advance percentage", d: "20%", check: (x) => (/^\d{1,2}(\.\d+)?%?$/.test(x) && parseFloat(x) > 0 ? "" : "Enter a percentage from 1 to 99, like 20%.")},
    discount_type: {l: "Discount type", d: "Percentage"},
    discount_value: {l: "Discount value", d: "1.5%"},
    maximum_discount: {l: "Maximum discount", d: "৳150.00"},
    minimum_order: {l: "Minimum order", d: "৳500.00"},
    rate_usd: {l: "US Dollar rate in ৳", d: "121.40", k: "num"},
    rate_eur: {l: "Euro rate in ৳", d: "131.20", k: "num"},
    rate_gbp: {l: "Pound Sterling rate in ৳", d: "154.75", k: "num"},
    rate_inr: {l: "Indian Rupee rate in ৳", d: "1.38", k: "num"},
    offline_bkash_number: {l: "bKash send money number", d: "01811-843300"},
    offline_rocket_number: {l: "Rocket send money number", d: "018118433001"},
    offline_bank_account: {l: "Bank transfer account number", d: "1402 3387 9915 004"},
    mode_full_payment: {l: "Full payment", d: true},
    mode_delivery_charge_only: {l: "Delivery charge only", d: true},
    mode_fixed_advance: {l: "Fixed advance", d: false},
    mode_percentage_advance: {l: "Percentage advance", d: true},
    mode_required_prepay: {l: "Required prepay (per product)", d: false},
    inside_dhaka_full_payment: {l: "Inside Dhaka: Full payment", d: true},
    inside_dhaka_delivery_charge_only: {l: "Inside Dhaka: Delivery charge only", d: true},
    inside_dhaka_fixed_advance: {l: "Inside Dhaka: Fixed advance", d: false},
    inside_dhaka_percentage_advance: {l: "Inside Dhaka: Percentage advance", d: true},
    inside_dhaka_required_prepay: {l: "Inside Dhaka: Required prepay (per product)", d: false},
    outside_dhaka_full_payment: {l: "Outside Dhaka: Full payment", d: true},
    outside_dhaka_delivery_charge_only: {l: "Outside Dhaka: Delivery charge only", d: false},
    outside_dhaka_fixed_advance: {l: "Outside Dhaka: Fixed advance", d: false},
    outside_dhaka_percentage_advance: {l: "Outside Dhaka: Percentage advance", d: true},
    outside_dhaka_required_prepay: {l: "Outside Dhaka: Required prepay (per product)", d: false},
    new_customer_full_payment: {l: "New customer: Full payment", d: true},
    new_customer_delivery_charge_only: {l: "New customer: Delivery charge only", d: false},
    new_customer_fixed_advance: {l: "New customer: Fixed advance", d: false},
    new_customer_percentage_advance: {l: "New customer: Percentage advance", d: true},
    new_customer_required_prepay: {l: "New customer: Required prepay (per product)", d: false},
    returning_customer_full_payment: {l: "Returning customer: Full payment", d: true},
    returning_customer_delivery_charge_only: {l: "Returning customer: Delivery charge only", d: true},
    returning_customer_fixed_advance: {l: "Returning customer: Fixed advance", d: false},
    returning_customer_percentage_advance: {l: "Returning customer: Percentage advance", d: true},
    returning_customer_required_prepay: {l: "Returning customer: Required prepay (per product)", d: false},
    wholesale_full_payment: {l: "Wholesale: Full payment", d: true},
    wholesale_delivery_charge_only: {l: "Wholesale: Delivery charge only", d: false},
    wholesale_fixed_advance: {l: "Wholesale: Fixed advance", d: true},
    wholesale_percentage_advance: {l: "Wholesale: Percentage advance", d: false},
    wholesale_required_prepay: {l: "Wholesale: Required prepay (per product)", d: false},
    vip_full_payment: {l: "VIP: Full payment", d: true},
    vip_delivery_charge_only: {l: "VIP: Delivery charge only", d: true},
    vip_fixed_advance: {l: "VIP: Fixed advance", d: true},
    vip_percentage_advance: {l: "VIP: Percentage advance", d: true},
    vip_required_prepay: {l: "VIP: Required prepay (per product)", d: false},
    mobile_and_electronics_full_payment: {l: "Mobile & Electronics: Full payment", d: true},
    mobile_and_electronics_percentage_advance: {l: "Mobile & Electronics: Percentage advance", d: true},
    grocery_fresh_delivery_charge_only: {l: "Grocery · Fresh: Delivery charge only", d: true},
    sslcommerz_mode: {l: "SSLCommerz mode", d: "Live"},
    sslcommerz_id: {l: "SSLCommerz store ID", d: "GridShop_live", req: (f) => !!f.get("sslcommerz", false)},
    sslcommerz_secret: {l: "SSLCommerz store password", d: "••••••••••", req: (f) => !!f.get("sslcommerz", false)},
    eps_mode: {l: "EPS mode", d: "Sandbox"},
    eps_id: {l: "EPS merchant ID", d: "EPS-TEST-0042", req: (f) => !!f.get("eps", false)},
    eps_secret: {l: "EPS hash key", d: "••••••••", req: (f) => !!f.get("eps", false)},
    nagad_mode: {l: "Nagad mode", d: "Live"},
    nagad_id: {l: "Nagad merchant ID", d: "6801811843300", req: (f) => !!f.get("nagad", false)},
    nagad_secret: {l: "Nagad private key", d: "••••••••••••", req: (f) => !!f.get("nagad", false)},
    stripe_mode: {l: "Stripe mode", d: "Sandbox"},
    stripe_id: {l: "Stripe publishable key", d: "", req: (f) => !!f.get("stripe", false)},
    stripe_secret: {l: "Stripe secret key", d: "", req: (f) => !!f.get("stripe", false)},
    paypal_mode: {l: "PayPal mode", d: "Sandbox"},
    paypal_id: {l: "PayPal client ID", d: "", req: (f) => !!f.get("paypal", false)},
    paypal_secret: {l: "PayPal client secret", d: "", req: (f) => !!f.get("paypal", false)},
  };
  /** A gateway's state as its row badge shows it: not set up, off, live or sandbox. */
  renderBadge(id) {
    const f = this.f;
    const on = f.get(id, false);
    const ready = id === "bkash" || (String(f.get(id + "_id", "")).trim() && String(f.get(id + "_secret", "")).trim());
    if (!ready) return { text: "Not set up", tone: { background: "#f1f5f9", color: "var(--text-muted)" } };
    if (!on) return { text: "Off", tone: { background: "#f1f5f9", color: "var(--text-muted)" } };
    return f.get(id + "_mode", "Live") === "Live"
      ? { text: "LIVE", tone: { background: "rgba(255,87,36,.12)", color: "var(--text-danger)" } }
      : { text: "SANDBOX", tone: { background: "rgba(255,152,0,.16)", color: "var(--text-warning)" } };
  }
  renderVals() {
    const f = this.f;
    return {
      f,
      badge: (id) => this.renderBadge(id),
      // the header counts come from the same state as each gateway's badge: on, set up, and in that mode
      live: ONLINE.filter((id) => this.renderBadge(id).text === "LIVE").length,
      sandbox: ONLINE.filter((id) => this.renderBadge(id).text === "SANDBOX").length,
      offline: ["bkash_send_money", "rocket_send_money", "bank_transfer"].filter((id) => f.get(id, false)).length,
      modes: ["mode_full_payment", "mode_delivery_charge_only", "mode_fixed_advance", "mode_percentage_advance", "mode_required_prepay"].filter((id) => f.get(id, false)).length,
      advance: Math.round(1240 * (Math.min(99, Math.max(0, parseFloat(f.get("advance_percentage", "20")) || 0)) / 100)),
      test: () => {
        const bad = ["bkash_app_key", "bkash_username", "bkash_password"].find((n) => this.check(n, f.get(n, "")));
        if (bad) { this.setState((st) => ({ errs: { ...st.errs, [bad]: this.check(bad, f.get(bad, "")) } }), () => f.focus(bad)); toast("Fill in the bKash credentials before testing.", { tone: "error" }); return; }
        toast("Connected to bKash in " + f.get("bkash_mode", "Live").toLowerCase() + " mode. Token issued in 380 ms.");
      },
      gateway: (name) => <GatewayPanel f={f} name={name} />,
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h442:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h443:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h444:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h445:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h446:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h447:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h448:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h449:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h450:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h451:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h452:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h453:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h454:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h455:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h456:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h457:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h458:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h459:hover{background:#f1f5f9 !important;color:#475569 !important}
/* phone: an exchange rate is two lines (code, name and 30-day change, then "1 USD =" and the rate field) */
@media (max-width:640px){
  .set-rates__head{display:none!important}
  .set-rates>div{flex-wrap:wrap;row-gap:8px!important}
  .set-rates>div>span:nth-child(1){order:0;width:auto!important}
  .set-rates>div>span:nth-child(2){order:1;flex:1 1 calc(100% - 120px)!important}
  .set-rates>div>span:nth-child(5){order:2;width:auto!important}
  .set-rates>div>span:nth-child(3){order:3;width:auto!important;white-space:nowrap}
  .set-rates>div>span:nth-child(4){order:4;flex:1 1 150px!important;width:auto!important}
}`;

// ---- markup ----

export default class SetPaymentsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetPayments">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="Payment Gateway" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="payment" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header className="set-pagehead">
                      <span className="set-pagehead__text">
                        <h1 className="ix-head__title">Payment Gateway</h1>
                        <__SetTips />
                        <span className="gc-pagehead__about" hidden>Optional configuration keeps its values while collapsed. A gateway in Live mode is marked in red everywhere it appears.</span>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>{v.live} live · {v.sandbox} sandbox · {v.offline} offline</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last saved 7 Sep 2026, 11:04 AM</span>
                      </span>
                    </header>
                    <GatewayList />
                    <section id="s0" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Online gateways</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,87,36,.12)", color: "var(--text-danger)" }}>{v.live} live</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "var(--text-warning)" }}>{v.sandbox} sandbox</span>
                          <button type="button" onClick={v.f.say("“Reorder” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="arrow-up-down" strokeWidth="1.75" width="15" height="15" />Reorder</button>
                        </span>
                      </div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#475569" }}>COD</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Cash on delivery</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>No credentials needed · 62% of orders last month</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Always live</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                        <__Sw f={v.f} n="cash_on_delivery" />
                        <button className="dc-h442" {...v.f.disc("gw_cash_on_delivery", false)} aria-label="Cash on delivery settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_cash_on_delivery", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("Cash on delivery")}</div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <PaymentLogo provider="sslcommerz" size={34} radius={9} decorative />
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>SSLCommerz</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Cards, internet banking and mobile wallets · merchant GridShop_live</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("sslcommerz").tone }}>{v.badge("sslcommerz").text}</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                        <__Sw f={v.f} n="sslcommerz" />
                        <button className="dc-h443" {...v.f.disc("gw_sslcommerz", false)} aria-label="SSLCommerz settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_sslcommerz", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("SSLCommerz")}</div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <PaymentLogo provider="eps" size={34} radius={9} decorative />
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>EPS</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Test account · no live credentials entered yet</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("eps").tone }}>{v.badge("eps").text}</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#ff9800" }} />
                        <__Sw f={v.f} n="eps" />
                        <button className="dc-h444" {...v.f.disc("gw_eps", false)} aria-label="EPS settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_eps", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("EPS")}</div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f6821f", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>NGD</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Nagad</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Merchant 6801811843300 · wallet only</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("nagad").tone }}>{v.badge("nagad").text}</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                        <__Sw f={v.f} n="nagad" />
                        <button className="dc-h445" {...v.f.disc("gw_nagad", false)} aria-label="Nagad settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_nagad", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("Nagad")}</div>
                      <div style={{ border: "1px solid #003087", borderRadius: "var(--radius-lg)", margin: "0 10px 10px", background: "#fff", boxShadow: "0 8px 22px -14px rgba(0,48,135,.5)", overflow: "hidden" }}>
                        <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 14px", background: "rgba(0,48,135,.05)" }}>
                          <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#e2136e", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>bK</span>
                          <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>bKash</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Tokenised checkout · 31% of online payments</span>
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("bkash").tone }}>{v.badge("bkash").text}</span>
                          <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                          <__Sw f={v.f} n="bkash" />
                          <button {...v.f.disc("gw_bkash", true)} aria-label="bKash settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#fff", color: "#475569", cursor: "pointer" }}>
                            <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                          </button>
                        </div>
                        <div {...v.f.panel("gw_bkash", true)} style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid rgba(255,152,0,.4)", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.08)", padding: "11px 13px" }}>
                            <__Icon name="triangle-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-warning)" }} />
                            <span style={{ display: "block", flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#7a4a00" }}>Live mode charges real customers on your production merchant account. Refunds must then be issued from the bKash portal — they cannot be reversed here.</span>
                            <__Seg f={v.f} n="bkash_mode" opts={["Sandbox","Live"]} tone="warn" />
                          </div>
                          <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px 20px", padding: "16px 0 4px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("bkash_app_key")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>App key <span className="set-req" aria-hidden="true">*</span></label>
                              </span>
                              <span id={v.f.id("bkash_app_key") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>bKash Merchant Portal → Developer → API Keys. Same value as “app_key” in the checkout SDK.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                                <__In f={v.f} n="bkash_app_key" labelled desc />
                                <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h446" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button type="button" onClick={v.f.copy("bkash_app_key")} className="dc-h447" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                              <__Err f={v.f} n="bkash_app_key" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>App secret <span style={{ color: "var(--text-danger)" }}>*</span></span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Saved</span>
                              </span>
                              <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Stored encrypted. Once saved it is never displayed again — replace it if you rotate the key.</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                                <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Secret saved · 17 Aug 2026</span>
                                <button type="button" onClick={v.f.say("“Replace” is not available in the demo yet.")} style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px 0 rgba(48,46,56,.1)" }}>Replace</button>
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("bkash_username")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Username <span className="set-req" aria-hidden="true">*</span></label>
                              </span>
                              <span id={v.f.id("bkash_username") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>The merchant username issued with your bKash tokenised checkout account.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                                <__In f={v.f} n="bkash_username" labelled desc />
                              </span>
                              <__Err f={v.f} n="bkash_username" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("bkash_password")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Password <span className="set-req" aria-hidden="true">*</span></label>
                              </span>
                              <span id={v.f.id("bkash_password") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Rotates every 90 days in the bKash portal. Reveal is logged in the audit trail.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                                <__In f={v.f} n="bkash_password" labelled desc />
                                <button type="button" onClick={v.f.say("Revealing a saved key is recorded in the audit log. It is switched off in this demo.")} className="dc-h448" aria-label="Reveal" title="Reveal" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button type="button" onClick={v.f.copy("bkash_password")} className="dc-h449" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                              <__Err f={v.f} n="bkash_password" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("bkash_merchant_number")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Merchant number</label>
                              </span>
                              <span id={v.f.id("bkash_merchant_number") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Printed on customer receipts and used for offline send-money reconciliation.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", width: "220px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                <__In f={v.f} n="bkash_merchant_number" labelled desc />
                              </span>
                              <__Err f={v.f} n="bkash_merchant_number" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <label htmlFor={v.f.id("bkash_checkout_label")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Checkout label</label>
                              </span>
                              <span id={v.f.id("bkash_checkout_label") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>What customers see at checkout. Bangla label falls back to this if unset.</span>
                              <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                                <__In f={v.f} n="bkash_checkout_label" labelled desc />
                              </span>
                              <__Err f={v.f} n="bkash_checkout_label" />
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "11px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                            <button type="button" onClick={v.test} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid var(--border-field)", background: "#fff", color: "#1e293b" }}><__Icon name="plug-zap" strokeWidth="1.75" width="15" height="15" />Test connection</button>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.1)", padding: "7px 11px", fontSize: "var(--text-xs)", color: "#047857" }}><__Icon name="circle-check" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-success)" }} />Connected · grant token issued in 380 ms</span>
                            <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last tested 7 Sep 2026, 4:12 PM · 62 transactions today</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "16px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Optional configuration</span>
                            <span style={{ height: "1px", flex: "1", background: "#e2e8f0" }} />
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>3 of 4 configured · collapsed sections keep their values</span>
                          </span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                            <button className="set-disc" {...v.f.disc("opt_webhook_callback_urls", true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                              <__Icon name="chevron-down" className="set-disc__chev" aria-hidden="true" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                              <__Icon name="link" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Webhook / callback URLs</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Generated for you — paste the IPN URL into the bKash Merchant Portal.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Copy only</span>
                            </button>
                            <div {...v.f.panel("opt_webhook_callback_urls", true)} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px" }}>
                              <span style={{ display: "block", maxWidth: "720px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>bKash Merchant Portal → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Application → Callback URL</b>. Tokenised Checkout returns the buyer through the Success URL directly; IPN is optional but recommended — it calls <span style={{ fontFamily: "var(--font-data)" }}>payment/status</span> to confirm before the order is marked paid.</span>
                              <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>IPN / Webhook URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(255,152,0,.16)", color: "var(--text-warning)" }}>Required</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/ipn?sid=696</span>
                                    <button type="button" onClick={v.f.copy("https://api.selorax.io/api/payments/bkash/ipn?sid=696", "URL")} className="dc-h450" aria-label="Copy URL" title="Copy URL" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last delivery 4:09 PM · 62 callbacks today, none failed</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Success URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/success</span>
                                    <button type="button" onClick={v.f.copy("https://api.selorax.io/api/payments/bkash/success", "URL")} className="dc-h451" aria-label="Copy URL" title="Copy URL" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Fail URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/fail</span>
                                    <button type="button" onClick={v.f.copy("https://api.selorax.io/api/payments/bkash/fail", "URL")} className="dc-h452" aria-label="Copy URL" title="Copy URL" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Cancel URL</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Optional</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "0 4px 0 11px" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#334155" }}>https://api.selorax.io/api/payments/bkash/cancel</span>
                                    <button type="button" onClick={v.f.copy("https://api.selorax.io/api/payments/bkash/cancel", "URL")} className="dc-h453" aria-label="Copy URL" title="Copy URL" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                      <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                            <button className="set-disc" {...v.f.disc("opt_payment_rules", true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                              <__Icon name="chevron-down" className="set-disc__chev" aria-hidden="true" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                              <__Icon name="sliders-horizontal" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Payment rules</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Order value limits, which payment modes this gateway may serve, and where it sits in the list.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>{v.modes} {v.modes === 1 ? "mode" : "modes"} on</span>
                            </button>
                            <div {...v.f.panel("opt_payment_rules", true)} style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "14px" }}>
                              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("priority")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Priority</label>
                                  </span>
                                  <span id={v.f.id("priority") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Lower shows first at checkout. Ties fall back to alphabetical.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="priority" labelled desc />
                                  </span>
                                  <__Err f={v.f} n="priority" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("min_order_amount")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Min order amount</label>
                                  </span>
                                  <span id={v.f.id("min_order_amount") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Gateway is hidden below this subtotal. Leave empty for no floor.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="min_order_amount" labelled desc placeholder="No minimum" />
                                  </span>
                                  <__Err f={v.f} n="min_order_amount" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("max_order_amount")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Max order amount</label>
                                  </span>
                                  <span id={v.f.id("max_order_amount") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Useful where the wallet itself caps a single transaction — bKash allows ৳25,000.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="max_order_amount" labelled desc />
                                  </span>
                                  <__Err f={v.f} n="max_order_amount" />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Allowed payment modes</span>
                                <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "620px" }}>What a buyer may pay online through this gateway. Anything not ticked falls to cash on delivery.</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "2px" }}>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <__Chk f={v.f} n="mode_full_payment" title="Full payment" desc="Buyer pays the whole order online." />
                                    <__Chk f={v.f} n="mode_delivery_charge_only" title="Delivery charge only" desc="Buyer pays only the delivery charge; the courier collects the balance." />
                                  </span>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <__Chk f={v.f} n="mode_fixed_advance" title="Fixed advance" desc="Buyer pays a set amount up front." />
                                    <__Chk f={v.f} n="mode_percentage_advance" title="Percentage advance" desc="Buyer pays a share of the order up front." />
                                  </span>
                                  <span style={{ display: "flex", gap: "10px" }}>
                                    <__Chk f={v.f} n="mode_required_prepay" title="Required prepay (per product)" desc="Amount computed from each product’s own prepay rule." />
                                    <span style={{ flex: "1" }} />
                                  </span>
                                </div>
                                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderLeft: "2px solid #e2e8f0", padding: "6px 0 0 14px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <label htmlFor={v.f.id("fixed_advance_amount")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Fixed advance amount</label>
                                    </span>
                                    <span id={v.f.id("fixed_advance_amount") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Tick “Fixed advance” above to set it.</span>
                                    <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                      <__In f={v.f} n="fixed_advance_amount" labelled desc dis={!v.f.get("mode_fixed_advance", false)} />
                                    </span>
                                    <__Err f={v.f} n="fixed_advance_amount" />
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <label htmlFor={v.f.id("advance_percentage")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Advance percentage</label>
                                    </span>
                                    <span id={v.f.id("advance_percentage") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Applied to the order subtotal, before delivery charge.</span>
                                    <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", width: "132px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      <__In f={v.f} n="advance_percentage" labelled desc />
                                    </span>
                                    <__Err f={v.f} n="advance_percentage" />
                                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>A {formatBDT(1240)} order asks for <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{formatBDT(v.advance)}</b> now, <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{formatBDT(1240 - v.advance)}</b> on delivery.</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "2px 13px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Force full payment</span>
                                    <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>When this gateway is eligible, cash on delivery is not offered for the order at all.</span>
                                  </span>
                                  <__Sw f={v.f} n="force_full_payment" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                            <button className="set-disc" {...v.f.disc("opt_payment_discount", true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                              <__Icon name="chevron-down" className="set-disc__chev" aria-hidden="true" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                              <__Icon name="star" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Payment discount</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Reward buyers for paying with this gateway. Applied to the online amount at checkout.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: v.f.get("payment_discount", false) ? "rgba(16,185,129,.14)" : "#f1f5f9", color: v.f.get("payment_discount", false) ? "var(--text-success)" : "var(--text-muted)" }}>{v.f.get("payment_discount", false) ? "On" : "Off"}</span>
                            </button>
                            <div {...v.f.panel("opt_payment_discount", true)} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px" }}>
                              <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "2px 13px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Payment discount</span>
                                    <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>When off, the four fields below are kept but ignored.</span>
                                  </span>
                                  <__Sw f={v.f} n="payment_discount" />
                                </div>
                              </div>
                              <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", opacity: ".6" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("discount_type")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Discount type</label>
                                  </span>
                                  <span id={v.f.id("discount_type") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Percentage or a flat amount off.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                                    <__In f={v.f} n="discount_type" labelled desc opts={["Percentage","Flat amount"]} dis={!v.f.get("payment_discount", false)} />
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                                  </span>
                                  <__Err f={v.f} n="discount_type" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("discount_value")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Value</label>
                                  </span>
                                  <span id={v.f.id("discount_value") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>bKash merchant cashback is commonly 1–2%.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="discount_value" labelled desc dis={!v.f.get("payment_discount", false)} />
                                  </span>
                                  <__Err f={v.f} n="discount_value" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("maximum_discount")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Maximum discount</label>
                                  </span>
                                  <span id={v.f.id("maximum_discount") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Caps the reward on large orders.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="maximum_discount" labelled desc dis={!v.f.get("payment_discount", false)} />
                                  </span>
                                  <__Err f={v.f} n="maximum_discount" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <label htmlFor={v.f.id("minimum_order")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Minimum order</label>
                                  </span>
                                  <span id={v.f.id("minimum_order") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Below this subtotal no discount is given.</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="minimum_order" labelled desc dis={!v.f.get("payment_discount", false)} />
                                  </span>
                                  <__Err f={v.f} n="minimum_order" />
                                </div>
                              </div>
                              <span style={{ display: "flex", alignItems: "center", gap: "9px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "9px 12px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="receipt" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />Checkout line would read <b style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>bKash discount −৳18.60</b> on a ৳1,240 order. The discount is your cost, not bKash’s.</span>
                            </div>
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", overflow: "hidden" }}>
                            <button className="set-disc" {...v.f.disc("opt_advanced_conditions", true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                              <__Icon name="chevron-down" className="set-disc__chev" aria-hidden="true" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                              <__Icon name="git-branch" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#003087" }} />
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Advanced conditions</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Different payment modes by delivery area, customer segment and cart category.</span>
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>2 areas · 4 segments</span>
                            </button>
                            <div {...v.f.panel("opt_advanced_conditions", true)} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "block" }}>
                                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Delivery area rules</span>
                                </span>
                                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Inside Dhaka</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Same-day and next-day zones</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="inside_dhaka_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="inside_dhaka_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="inside_dhaka_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="inside_dhaka_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="inside_dhaka_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Outside Dhaka</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Courier network · higher return rate</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="outside_dhaka_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="outside_dhaka_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="outside_dhaka_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="outside_dhaka_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="outside_dhaka_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "block" }}>
                                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Customer type rules</span>
                                </span>
                                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>New customer</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>No completed orders yet</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="new_customer_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="new_customer_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="new_customer_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="new_customer_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="new_customer_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Returning customer</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>At least one completed order</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="returning_customer_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="returning_customer_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="returning_customer_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="returning_customer_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="returning_customer_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Wholesale</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Merchant-tagged bulk buyer</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="wholesale_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="wholesale_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="wholesale_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="wholesale_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="wholesale_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 12px" }}>
                                    <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>VIP</span>
                                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Merchant-tagged loyalty tier</span>
                                    </span>
                                    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="vip_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="vip_delivery_charge_only" title="Delivery charge only" />
                                      <__Chk chip f={v.f} n="vip_fixed_advance" title="Fixed advance" />
                                      <__Chk chip f={v.f} n="vip_percentage_advance" title="Percentage advance" />
                                      <__Chk chip f={v.f} n="vip_required_prepay" title="Required prepay (per product)" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <span style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                  <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                    <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Category rules</span>
                                  </span>
                                  <button type="button" onClick={v.f.say("“Add rule” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "1px solid var(--border-field)", background: "#fff", color: "#1e293b" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add rule</button>
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "26px", flex: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}><__Icon name="tag" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />{"Mobile & Electronics"}</span>
                                    <__Icon name="arrow-right" strokeWidth="1.75" width="15" height="15" style={{ flex: "none", color: "#cbd5e1" }} />
                                    <span style={{ flex: "1", minWidth: "0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="mobile_and_electronics_full_payment" title="Full payment" />
                                      <__Chk chip f={v.f} n="mobile_and_electronics_percentage_advance" title="Percentage advance" />
                                    </span>
                                    <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                                      <button type="button" onClick={v.f.say("“Edit rule” is not available in the demo yet.")} className="dc-h454" aria-label="Edit rule" title="Edit rule" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                      <button type="button" onClick={v.f.say("“Delete rule” is not available in the demo yet.")} className="dc-h455" aria-label="Delete rule" title="Delete rule" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "26px", flex: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155" }}><__Icon name="tag" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />Grocery · Fresh</span>
                                    <__Icon name="arrow-right" strokeWidth="1.75" width="15" height="15" style={{ flex: "none", color: "#cbd5e1" }} />
                                    <span style={{ flex: "1", minWidth: "0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      <__Chk chip f={v.f} n="grocery_fresh_delivery_charge_only" title="Delivery charge only" />
                                    </span>
                                    <span style={{ flex: "none", display: "flex", gap: "5px" }}>
                                      <button type="button" onClick={v.f.say("“Edit rule” is not available in the demo yet.")} className="dc-h456" aria-label="Edit rule" title="Edit rule" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                      <button type="button" onClick={v.f.say("“Delete rule” is not available in the demo yet.")} className="dc-h457" aria-label="Delete rule" title="Delete rule" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                        <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#635bff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>STR</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Stripe</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>International cards · not configured</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("stripe").tone }}>{v.badge("stripe").text}</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", border: "1.5px solid #cbd5e1", boxSizing: "border-box" }} />
                        <__Sw f={v.f} n="stripe" />
                        <button className="dc-h458" {...v.f.disc("gw_stripe", false)} aria-label="Stripe settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_stripe", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("Stripe")}</div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>PP</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>PayPal</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Export orders only · unavailable to BD-domiciled merchants</span>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", ...v.badge("paypal").tone }}>{v.badge("paypal").text}</span>
                        <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "var(--radius-full)", border: "1.5px solid #cbd5e1", boxSizing: "border-box" }} />
                        <__Sw f={v.f} n="paypal" />
                        <button className="dc-h459" {...v.f.disc("gw_paypal", false)} aria-label="PayPal settings" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                          <__Icon name="chevron-down" className="set-chev" aria-hidden="true" strokeWidth="1.75" width="17" height="17" />
                        </button>
                      </div>
                      <div {...v.f.panel("gw_paypal", false)} style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>{v.gateway("PayPal")}</div>
                    </section>
                    <section id="s1" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Currency exchange rates</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Fetched 7 Sep, 6:00 AM</span>
                          <button type="button" onClick={v.f.say("Exchange rates are up to date. They were fetched today at 6:00 AM.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="15" height="15" />Refresh rates</button>
                        </span>
                      </div>
                      <div className="set-rates" style={{ padding: "6px 0 10px" }}>
                        <div className="set-rates__head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 16px 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>
                          <span style={{ width: "60px", flex: "none" }}>Code</span>
                          <span style={{ flex: "1" }}>Currency</span>
                          <span style={{ width: "40px", flex: "none" }} />
                          <span style={{ width: "150px", flex: "none" }}>Rate in ৳</span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right" }}>30-day</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>USD</span>
                          <span style={{ flex: "1", minWidth: "0", color: "var(--text-muted)" }}>US Dollar</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "var(--text-muted)" }}>1 USD</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="rate_usd" />
                            </span>
                            <__Err f={v.f} n="rate_usd" />
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-success)" }}>+0.9%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>EUR</span>
                          <span style={{ flex: "1", minWidth: "0", color: "var(--text-muted)" }}>Euro</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "var(--text-muted)" }}>1 EUR</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="rate_eur" />
                            </span>
                            <__Err f={v.f} n="rate_eur" />
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-success)" }}>+1.4%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>GBP</span>
                          <span style={{ flex: "1", minWidth: "0", color: "var(--text-muted)" }}>Pound Sterling</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "var(--text-muted)" }}>1 GBP</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="rate_gbp" />
                            </span>
                            <__Err f={v.f} n="rate_gbp" />
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-danger)" }}>−0.3%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 16px", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ width: "60px", flex: "none", fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>INR</span>
                          <span style={{ flex: "1", minWidth: "0", color: "var(--text-muted)" }}>Indian Rupee</span>
                          <span style={{ width: "40px", flex: "none", textAlign: "right", color: "var(--text-muted)" }}>1 INR</span>
                          <span style={{ width: "150px", flex: "none" }}>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                              <__Icon name="equal" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                              <__In f={v.f} n="rate_inr" />
                            </span>
                            <__Err f={v.f} n="rate_inr" />
                          </span>
                          <span style={{ width: "96px", flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-success)" }}>+0.2%</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Offline gateways</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>{v.offline} on</span>
                          <button type="button" onClick={v.f.say("“Add gateway” is not available in the demo yet.")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="plus" strokeWidth="1.75" width="15" height="15" />Add gateway</button>
                        </span>
                      </div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#e2136e", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>bK</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>bKash send money</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Instructions shown at checkout, in Bangla and English. 14 orders awaiting review.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="smartphone" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="offline_bkash_number" />
                          </span>
                          <__Err f={v.f} n="offline_bkash_number" />
                        </span>
                        <__Sw f={v.f} n="bkash_send_money" />
                      </div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <PaymentLogo provider="rocket" size={34} radius={9} decorative />
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rocket send money</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Dutch-Bangla mobile banking. Account must include the trailing digit.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="smartphone" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="offline_rocket_number" />
                          </span>
                          <__Err f={v.f} n="offline_rocket_number" />
                        </span>
                        <__Sw f={v.f} n="rocket_send_money" />
                      </div>
                      <div className="set-wrap" style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "13px 16px" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#0f172a", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", color: "#fff" }}>BNK</span>
                        <span className="set-row__text" style={{ display: "block", flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Bank transfer</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>City Bank PLC · Feni branch · A/C GridShop Smart Commerce Ltd.</span>
                        </span>
                        <span style={{ width: "230px", flex: "none" }}>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                            <__Icon name="landmark" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="offline_bank_account" />
                          </span>
                          <__Err f={v.f} n="offline_bank_account" />
                        </span>
                        <__Sw f={v.f} n="bank_transfer" />
                      </div>
                    </section>
                  </main>
                </div>
                <__SaveBar f={v.f} note="· 11:04 AM by Ashiq Khan" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
