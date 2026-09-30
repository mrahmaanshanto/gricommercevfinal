'use client';
// Generated from design/templates/settings-console/SetDelivery.dc.html by scripts/convert-design.mjs.
// SetDelivery
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
.dc-h431:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h432:hover{background:#f8fafc !important;color:#1e293b !important}
.dc-h433:hover{background:#002a77 !important}`;

// ---- markup ----

export default class SetDeliveryScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetDelivery">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <__SettingsSwitcher />
        <div style={{ position: "relative", width: "100%", minWidth: "1180px", height: "100vh", overflow: "hidden", display: "flex", gap: "12px", padding: "12px", background: "#eef2f7", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div data-dc-import="SetChrome" style={{ flex: "none", height: "100%" }}><__SetChrome /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" }}>
            <div data-dc-import="SetTopbar" style={{ flex: "none", width: "100%" }}><__SetTopbar crumb="Delivery Settings" /></div>
            <div style={{ flex: "1", minHeight: "0", display: "flex" }}>
              <div data-dc-import="SetRail" style={{ flex: "none", height: "100%" }}><__SetRail active="delivery" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: "1", minHeight: "0", overflow: "auto", display: "flex", alignItems: "flex-start", gap: "26px", padding: "22px 26px 26px" }}>
                  <main style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <header style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <span style={{ display: "block", minWidth: "0" }}>
                        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "600", letterSpacing: "-.015em", color: "#0f172a" }}>Delivery Settings</h1>
                        <p style={{ margin: "0", maxWidth: "640px", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>Charges, courier cost and promised time across three zones. It is a matrix, so it is laid out as one — twelve numbers in a table you can read across, not twenty-four stacked inputs.</p>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>3 zones · 15 values</span>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Last saved 4 Sep 2026, 6:20 pm</span>
                      </span>
                    </header>
                    <section id="s0" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>{"Origin & partner"}</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Where shipments leave from and who carries them by default.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>3 settings</span>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Online orders ship from <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Default pickup address given to couriers for online orders, and the base for zone matching.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <__Icon name="warehouse" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Central Warehouse — Plot 12, Tejgaon I/A, Dhaka</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>If an item is out of stock there, the nearest branch or hub with every item ships instead. Staff can change it on the order.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Default shipping partner <span style={{ color: "#c2380f" }}>*</span></span>
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>Pre-selected when a shipment is created. Staff can change it per order.</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                            <__Icon name="truck" strokeWidth="1.75" width="15" height="15" style={{ color: "#94a3b8" }} />
                            <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Pathao</span>
                            <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#059669" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Credentials valid · webhook receiving</span>
                        </div>
                      </div>
                      <div style={{ padding: "0 18px 12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>Show the shipment modal on status change</span>
                            <span style={{ display: "block", paddingTop: "3px", fontSize: "12px", lineHeight: "17px", color: "#64748b", maxWidth: "560px" }}>When an order moves to “Shipped”, ask for courier and tracking code instead of saving silently. Recommended while staff are learning.</span>
                          </span>
                          <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "38px", height: "22px", borderRadius: "9999px", background: "#003087", padding: "2px", cursor: "pointer" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </span>
                        </div>
                      </div>
                    </section>
                    <section id="s1" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>Charges by zone</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>One row per zone, one column per charge. Values are per order unless the column says per unit.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "21px", borderRadius: "9999px", padding: "0 8px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".02em", background: "#f1f5f9", color: "#64748b" }}>BDT ৳</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", borderRadius: "8px", padding: "0 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="copy" strokeWidth="1.75" width="15" height="15" />Copy Inside row to all</button>
                        </span>
                      </div>
                      <div style={{ overflow: "auto", padding: "4px 0 0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Zone</th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Delivery charge<span style={{ display: "block", fontWeight: "400", letterSpacing: "0", textTransform: "none", fontSize: "10.5px", color: "#94a3b8" }}>customer pays</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Extra per unit<span style={{ display: "block", fontWeight: "400", letterSpacing: "0", textTransform: "none", fontSize: "10.5px", color: "#94a3b8" }}>qty above 1</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Courier cost<span style={{ display: "block", fontWeight: "400", letterSpacing: "0", textTransform: "none", fontSize: "10.5px", color: "#94a3b8" }}>you pay</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Courier extra<span style={{ display: "block", fontWeight: "400", letterSpacing: "0", textTransform: "none", fontSize: "10.5px", color: "#94a3b8" }}>per unit</span></th>
                              <th style={{ padding: "9px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", whiteSpace: "nowrap" }}>Delivery time<span style={{ display: "block", fontWeight: "400", letterSpacing: "0", textTransform: "none", fontSize: "10.5px", color: "#94a3b8" }}>shown at checkout</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Inside Dhaka</span>
                                <span style={{ display: "block", fontSize: "11px", fontWeight: "400", color: "#64748b" }}>Dhaka city corporations</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>70.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>10.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>55.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>8.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1</span>
                                  </span>
                                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>to</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>2</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Days</span>
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                                  </span>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Sub-Dhaka</span>
                                <span style={{ display: "block", fontSize: "11px", fontWeight: "400", color: "#64748b" }}>Savar, Gazipur, Narayanganj, Keraniganj</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>110.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>15.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>90.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>12.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>2</span>
                                  </span>
                                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>to</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>3</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Days</span>
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                                  </span>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row" style={{ textAlign: "left", padding: "7px 14px 7px 16px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#fcfdfe" }}>
                                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e293b" }}>Outside Dhaka</span>
                                <span style={{ display: "block", fontSize: "11px", fontWeight: "400", color: "#64748b" }}>Rest of Bangladesh</span>
                              </th>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>150.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>20.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>125.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "104px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                  <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>18.00</span>
                                </span>
                              </td>
                              <td style={{ padding: "7px 8px", borderBottom: "1px solid #f1f5f9", borderLeft: "1px solid #f1f5f9" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>3</span>
                                  </span>
                                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>to</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "58px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>5</span>
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "92px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontSize: "13.5px", color: "#1e293b" }}>
                                    <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Days</span>
                                    <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "#94a3b8" }} />
                                  </span>
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "12px 16px" }}>
                        <__Icon name="info" strokeWidth="1.75" width="16" height="16" style={{ flex: "none", color: "#94a3b8" }} />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>Margin per zone is calculated for you: <b style={{ fontWeight: "600", color: "#059669" }}>+৳15 inside Dhaka</b>, <b style={{ fontWeight: "600", color: "#059669" }}>+৳20 sub-Dhaka</b>, <b style={{ fontWeight: "600", color: "#059669" }}>+৳25 outside Dhaka</b>. A negative margin is flagged before you save.</span>
                      </div>
                    </section>
                    <section id="s2" style={{ border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 18px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: "15px", fontWeight: "600", letterSpacing: ".01em", color: "#1e293b" }}>What the customer sees</span>
                          <span style={{ display: "block", paddingTop: "2px", fontSize: "12px", color: "#64748b" }}>Rendered from the values above — check the wording before saving.</span>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", padding: "16px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 13px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Inside Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "19px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳70</b>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>1–2 days</span>
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Dhaka city · +৳10 per extra unit</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 13px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Sub-Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "19px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳110</b>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>2–3 days</span>
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Dhaka suburbs · +৳15 per extra unit</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 13px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#1e293b" }}>Outside Dhaka</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
                            <b style={{ fontSize: "19px", fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳150</b>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>3–5 days</span>
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Rest of Bangladesh · +৳20 per extra unit</span>
                        </div>
                      </div>
                    </section>
                  </main>
                  <aside style={{ position: "sticky", top: "0", width: "186px", flex: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8" }}>On this page</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderLeft: "2px solid #e2e8f0" }}>
                      <a href="#s0" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>{"Origin & partner"}<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>3</span></a>
                      <a href="#s1" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid #003087", padding: "6px 10px", fontSize: "12.5px", fontWeight: "600", color: "#003087", textDecoration: "none" }}>Charges by zone<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>12</span></a>
                      <a href="#s2" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "-2px", borderLeft: "2px solid transparent", padding: "6px 10px", fontSize: "12.5px", color: "#64748b", textDecoration: "none" }}>Customer preview<span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "400", color: "#94a3b8" }} /></a>
                    </div>
                    <span style={{ height: "1px", background: "#e2e8f0", margin: "4px 0" }} />
                    <span style={{ fontSize: "11.5px", lineHeight: "17px", color: "#64748b" }}>Courier cost is what you pay; delivery charge is what the customer pays.</span>
                  </aside>
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "9px", fontSize: "13.5px", fontWeight: "500", color: "#1e293b" }}><span style={{ display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "9999px", background: "rgba(0,156,222,.16)", color: "#0089c3" }}>
  <__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />
</span>2 unsaved changes</span>
                  <button className="dc-h431" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "9999px", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Review changes<__Icon name="chevron-up" strokeWidth="1.75" width="14" height="14" /></button>
                  <span style={{ flex: "1" }} />
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>⌘S to save</span>
                  <button className="dc-h432" style={{ display: "inline-flex", alignItems: "center", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Discard</button>
                  <button className="dc-h433" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 18px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".02em", color: "#fff", cursor: "pointer", boxShadow: "0 6px 16px -8px rgba(0,48,135,.7)" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
