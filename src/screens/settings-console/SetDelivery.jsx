'use client';
// Generated from design/templates/settings-console/SetDelivery.dc.html by scripts/convert-design.mjs.
// SetDelivery
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSw as __Sw, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "delivery";
  fields = {
    show_the_shipment_modal_on_status_change: {l: "Show the shipment modal on status change", d: true},
    online_orders_ship_from: {l: "Online orders ship from", d: "Central Warehouse — Plot 12, Tejgaon I/A, Dhaka", req: true},
    default_shipping_partner: {l: "Default shipping partner", d: "Pathao", req: true},
    inside_dhaka_delivery_charge: {l: "Inside Dhaka: Delivery charge", d: "70.00", k: "num", req: true},
    inside_dhaka_extra_per_unit: {l: "Inside Dhaka: Extra per unit", d: "10.00", k: "num", req: true},
    inside_dhaka_courier_cost: {l: "Inside Dhaka: Courier cost", d: "55.00", k: "num", req: true},
    inside_dhaka_courier_extra: {l: "Inside Dhaka: Courier extra", d: "8.00", k: "num", req: true},
    inside_dhaka_delivery_time: {l: "Inside Dhaka: Delivery time (from)", d: "1", k: "int", req: true},
    inside_dhaka_delivery_time_to: {l: "Inside Dhaka: Delivery time (to)", d: "2", k: "int", req: true, check: (x, f) => (+x < +f.get("inside_dhaka_delivery_time", "0") ? "The longest time cannot be shorter than the shortest time." : "")},
    inside_dhaka_delivery_time_unit: {l: "Inside Dhaka: Delivery time (unit)", d: "Days"},
    sub_dhaka_delivery_charge: {l: "Sub-Dhaka: Delivery charge", d: "110.00", k: "num", req: true},
    sub_dhaka_extra_per_unit: {l: "Sub-Dhaka: Extra per unit", d: "15.00", k: "num", req: true},
    sub_dhaka_courier_cost: {l: "Sub-Dhaka: Courier cost", d: "90.00", k: "num", req: true},
    sub_dhaka_courier_extra: {l: "Sub-Dhaka: Courier extra", d: "12.00", k: "num", req: true},
    sub_dhaka_delivery_time: {l: "Sub-Dhaka: Delivery time (from)", d: "2", k: "int", req: true},
    sub_dhaka_delivery_time_to: {l: "Sub-Dhaka: Delivery time (to)", d: "3", k: "int", req: true, check: (x, f) => (+x < +f.get("sub_dhaka_delivery_time", "0") ? "The longest time cannot be shorter than the shortest time." : "")},
    sub_dhaka_delivery_time_unit: {l: "Sub-Dhaka: Delivery time (unit)", d: "Days"},
    outside_dhaka_delivery_charge: {l: "Outside Dhaka: Delivery charge", d: "150.00", k: "num", req: true},
    outside_dhaka_extra_per_unit: {l: "Outside Dhaka: Extra per unit", d: "20.00", k: "num", req: true},
    outside_dhaka_courier_cost: {l: "Outside Dhaka: Courier cost", d: "125.00", k: "num", req: true},
    outside_dhaka_courier_extra: {l: "Outside Dhaka: Courier extra", d: "18.00", k: "num", req: true},
    outside_dhaka_delivery_time: {l: "Outside Dhaka: Delivery time (from)", d: "3", k: "int", req: true},
    outside_dhaka_delivery_time_to: {l: "Outside Dhaka: Delivery time (to)", d: "5", k: "int", req: true, check: (x, f) => (+x < +f.get("outside_dhaka_delivery_time", "0") ? "The longest time cannot be shorter than the shortest time." : "")},
    outside_dhaka_delivery_time_unit: {l: "Outside Dhaka: Delivery time (unit)", d: "Days"},
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      zones: [["inside_dhaka", "inside Dhaka"], ["sub_dhaka", "sub-Dhaka"], ["outside_dhaka", "outside Dhaka"]].map(([id, short]) => {
        const num = (n) => parseFloat(String(f.get(id + "_" + n, "0")).replace(/,/g, "")) || 0;
        const margin = num("delivery_charge") - num("courier_cost");
        const unit = String(f.get(id + "_delivery_time_unit", "Days")).toLowerCase();
        return {
          id, short, margin,
          marginText: (margin < 0 ? "−" : "+") + formatBDT(Math.abs(margin)),
          charge: formatBDT(num("delivery_charge")),
          extra: formatBDT(num("extra_per_unit")),
          time: f.get(id + "_delivery_time", "") + "–" + f.get(id + "_delivery_time_to", "") + " " + unit,
        };
      }),
      copyRow: () => {
        const cols = ["delivery_charge", "extra_per_unit", "courier_cost", "courier_extra", "delivery_time", "delivery_time_to", "delivery_time_unit"];
        for (const zone of ["sub_dhaka", "outside_dhaka"]) for (const c of cols) f.set(zone + "_" + c, f.get("inside_dhaka_" + c, ""));
        toast("Inside Dhaka values copied to the other two zones. Save to keep them.", { tone: "info" });
      },
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h431:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h432:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h433:hover{background:#002a77 !important}
/* phone: each zone is a card; every charge is a label (with its note under it) and a field in one column */
.set-zl{display:none}
@media (max-width:640px){
  .set-zones.gc-cards-on>tbody>tr>td{display:grid!important;grid-template-columns:minmax(0,1fr) 120px;align-items:center;gap:6px 12px;padding:6px 0!important;text-align:left!important}
  .set-zones.gc-cards-on>tbody>tr>td::before{display:none!important}
  .set-zones.gc-cards-on>tbody>tr>td:last-child{grid-template-columns:minmax(0,1fr)}
  .set-zones .set-zl{display:block;min-width:0;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);line-height:18px;color:#1e293b}
  .set-zones .set-zl small{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
  .set-zones td>.set-box{width:100%!important;height:44px!important}
  .set-zones td>.set-err{grid-column:1/-1}
  .set-zt{flex-wrap:wrap;gap:8px!important}
  .set-zt>.set-box{flex:none;height:44px!important}
  .set-zt>.set-box:last-of-type{flex:1 1 92px}
}`;

/* the label a zone's field carries on a phone (the column header is hidden there) */
const ZL = ({ l, s }) => <span className="set-zl" aria-hidden="true">{l}<small>{s}</small></span>;

// ---- markup ----

export default class SetDeliveryScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetDelivery">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="Delivery Settings" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="delivery" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Delivery Settings</h1>
                        <__SetTips />
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>3 zones · 15 values</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last saved 4 Sep 2026, 6:20 PM</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>{"Origin & partner"}</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>3 settings</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("online_orders_ship_from")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Online orders ship from <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("online_orders_ship_from") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Default pickup address given to couriers for online orders, and the base for zone matching.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__Icon name="warehouse" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="online_orders_ship_from" labelled desc opts={["Central Warehouse — Plot 12, Tejgaon I/A, Dhaka","Feni branch — 4th floor, Feni Center, Feni","Gulshan branch — Gulshan Avenue, Dhaka","Chattogram hub — Agrabad C/A, Chattogram"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="online_orders_ship_from" />
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>If an item is out of stock there, the nearest branch or hub with every item ships instead. Staff can change it on the order.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("default_shipping_partner")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Default shipping partner <span className="set-req" aria-hidden="true">*</span></label>
                          </span>
                          <span id={v.f.id("default_shipping_partner") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Pre-selected when a shipment is created. Staff can change it per order.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                            <__Icon name="truck" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <__In f={v.f} n="default_shipping_partner" labelled desc opts={["Pathao","Steadfast","RedX"]} />
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                          </span>
                          <__Err f={v.f} n="default_shipping_partner" />
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Credentials valid · webhook receiving</span>
                        </div>
                      </div>
                      <div style={{ padding: "0 18px 12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Show the shipment modal on status change</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>When an order moves to “Shipped”, ask for courier and tracking code instead of saving silently. Recommended while staff are learning.</span>
                          </span>
                          <__Sw f={v.f} n="show_the_shipment_modal_on_status_change" />
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>Charges by zone</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>All amounts in ৳</span>
                          <button type="button" onClick={v.copyRow} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="copy" strokeWidth="1.75" width="15" height="15" />Copy Inside row to all</button>
                        </span>
                      </div>
                      <div className="gc-table-wrap" style={{ overflow: "auto", padding: "4px 0 0" }}>
                        <table className="set-zones" style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Zone</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Delivery charge<span style={{ display: "block", fontWeight: "var(--weight-regular)", letterSpacing: "0", textTransform: "none", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>customer pays</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Extra per unit<span style={{ display: "block", fontWeight: "var(--weight-regular)", letterSpacing: "0", textTransform: "none", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>qty above 1</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Courier cost<span style={{ display: "block", fontWeight: "var(--weight-regular)", letterSpacing: "0", textTransform: "none", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>you pay</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Courier extra<span style={{ display: "block", fontWeight: "var(--weight-regular)", letterSpacing: "0", textTransform: "none", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>per unit</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Delivery time<span style={{ display: "block", fontWeight: "var(--weight-regular)", letterSpacing: "0", textTransform: "none", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>shown at checkout</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Inside Dhaka</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>Dhaka city corporations</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery charge" s="customer pays" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="inside_dhaka_delivery_charge" />
                                </span>
                                <__Err f={v.f} n="inside_dhaka_delivery_charge" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Extra per unit" s="qty above 1" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="inside_dhaka_extra_per_unit" />
                                </span>
                                <__Err f={v.f} n="inside_dhaka_extra_per_unit" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier cost" s="you pay" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="inside_dhaka_courier_cost" />
                                </span>
                                <__Err f={v.f} n="inside_dhaka_courier_cost" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier extra" s="per unit" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="inside_dhaka_courier_extra" />
                                </span>
                                <__Err f={v.f} n="inside_dhaka_courier_extra" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery time" s="shown at checkout" />
                                <span className="set-zt" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="inside_dhaka_delivery_time" />
                                  </span>
                                  <__Err f={v.f} n="inside_dhaka_delivery_time" />
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>to</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="inside_dhaka_delivery_time_to" />
                                  </span>
                                  <__Err f={v.f} n="inside_dhaka_delivery_time_to" />
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                                    <__In f={v.f} n="inside_dhaka_delivery_time_unit" opts={["Days","Hours"]} />
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                                  </span>
                                  <__Err f={v.f} n="inside_dhaka_delivery_time_unit" />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Sub-Dhaka</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>Savar, Gazipur, Narayanganj, Keraniganj</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery charge" s="customer pays" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="sub_dhaka_delivery_charge" />
                                </span>
                                <__Err f={v.f} n="sub_dhaka_delivery_charge" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Extra per unit" s="qty above 1" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="sub_dhaka_extra_per_unit" />
                                </span>
                                <__Err f={v.f} n="sub_dhaka_extra_per_unit" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier cost" s="you pay" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="sub_dhaka_courier_cost" />
                                </span>
                                <__Err f={v.f} n="sub_dhaka_courier_cost" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier extra" s="per unit" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="sub_dhaka_courier_extra" />
                                </span>
                                <__Err f={v.f} n="sub_dhaka_courier_extra" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery time" s="shown at checkout" />
                                <span className="set-zt" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="sub_dhaka_delivery_time" />
                                  </span>
                                  <__Err f={v.f} n="sub_dhaka_delivery_time" />
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>to</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="sub_dhaka_delivery_time_to" />
                                  </span>
                                  <__Err f={v.f} n="sub_dhaka_delivery_time_to" />
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                                    <__In f={v.f} n="sub_dhaka_delivery_time_unit" opts={["Days","Hours"]} />
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                                  </span>
                                  <__Err f={v.f} n="sub_dhaka_delivery_time_unit" />
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Outside Dhaka</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>Rest of Bangladesh</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery charge" s="customer pays" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="outside_dhaka_delivery_charge" />
                                </span>
                                <__Err f={v.f} n="outside_dhaka_delivery_charge" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Extra per unit" s="qty above 1" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="outside_dhaka_extra_per_unit" />
                                </span>
                                <__Err f={v.f} n="outside_dhaka_extra_per_unit" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier cost" s="you pay" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="outside_dhaka_courier_cost" />
                                </span>
                                <__Err f={v.f} n="outside_dhaka_courier_cost" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <ZL l="Courier extra" s="per unit" />
                                <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <__In f={v.f} n="outside_dhaka_courier_extra" />
                                </span>
                                <__Err f={v.f} n="outside_dhaka_courier_extra" />
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <ZL l="Delivery time" s="shown at checkout" />
                                <span className="set-zt" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="outside_dhaka_delivery_time" />
                                  </span>
                                  <__Err f={v.f} n="outside_dhaka_delivery_time" />
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>to</span>
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <__In f={v.f} n="outside_dhaka_delivery_time_to" />
                                  </span>
                                  <__Err f={v.f} n="outside_dhaka_delivery_time_to" />
                                  <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                                    <__In f={v.f} n="outside_dhaka_delivery_time_unit" opts={["Days","Hours"]} />
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                                  </span>
                                  <__Err f={v.f} n="outside_dhaka_delivery_time_unit" />
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "12px 16px" }}>
                        <__Icon name="info" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "var(--text-muted)" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Margin per zone is calculated for you: {v.zones.map((z, i) => (<React.Fragment key={z.id}>{i ? ", " : ""}<b style={{ fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ color: z.margin < 0 ? "var(--text-danger)" : undefined }}>{z.marginText} {z.short}</span></b></React.Fragment>))}. {v.zones.some((z) => z.margin < 0) ? "A zone shown in red costs you more than the customer pays." : "No zone is losing money."}</span>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div className="set-head" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".01em", color: "#1e293b" }}>What the customer sees</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }} />
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "16px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "12px 13px" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Inside Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.zones[0].charge}</b>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.zones[0].time}</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Dhaka city · +{v.zones[0].extra} per extra unit</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "12px 13px" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Sub-Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.zones[1].charge}</b>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.zones[1].time}</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Dhaka suburbs · +{v.zones[1].extra} per extra unit</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "12px 13px" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Outside Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.zones[2].charge}</b>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.zones[2].time}</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Rest of Bangladesh · +{v.zones[2].extra} per extra unit</span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside className="set-toc" aria-label="On this page">
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>{"Origin & partner"}<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>3</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", textDecoration: "none" }}>Charges by zone<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>12</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textDecoration: "none" }}>Customer preview<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }} /></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>Courier cost is what you pay; delivery charge is what the customer pays.</span>
                  </aside>
                </div>
                <__SaveBar f={v.f} note="· 4 Sep 2026, 6:20 PM" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
