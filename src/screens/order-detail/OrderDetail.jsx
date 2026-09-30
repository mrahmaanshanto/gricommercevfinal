'use client';
// Generated from design/templates/order-detail/OrderDetail.dc.html by scripts/convert-design.mjs.
// OrderDetail — Single order workspace — fulfilment stepper, line items, payment summary, courier performance and action forms, customer/verification/notes rail, tracking and activity log.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { action: 'Approve', tracking: true };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const a = this.state.action;
    const meta = {
      Approve: { bg: '#003087', title: 'Approve order for delivery', hint: 'Confirm the address and courier, then push the parcel to the selected courier.', cta: 'Approve order' },
      Hold: { bg: '#9a5b00', title: 'Put order on hold', hint: 'The order stays in the pipeline but is hidden from courier pushes until released.', cta: 'Hold order' },
      Cancel: { bg: '#b8330f', title: 'Cancel this order', hint: 'Stock is returned to inventory and the customer is notified by SMS.', cta: 'Cancel order' },
      'Mark delivered': { bg: '#047857', title: 'Mark as delivered', hint: 'Records the collected amount and closes the fulfilment cycle.', cta: 'Mark as delivered' }
    };
    const m = meta[a];
    return {
      actions: ['Approve', 'Hold', 'Cancel', 'Mark delivered'].map(k => ({
        label: k, off: a !== k,
        onApprove: a === k && k === 'Approve',
        onHold: a === k && k === 'Hold',
        onCancel: a === k && k === 'Cancel',
        onDelivered: a === k && k === 'Mark delivered',
        onClick: () => this.setState({ action: k })
      })),
      panelTitle: m.title, panelHint: m.hint,
      ctaApprove: a === 'Approve', ctaHold: a === 'Hold', ctaCancel: a === 'Cancel', ctaDelivered: a === 'Mark delivered',
      trackingOpen: this.state.tracking,
      trackingToggle: this.state.tracking ? 'Hide summary' : 'Show summary',
      toggleTracking: () => this.setState(s => ({ tracking: !s.tracking })),
      couriers: [
        { name: 'Steadfast', rate: '0%', delivered: 0, cancelled: 0, total: 0 },
        { name: 'Pathao', rate: '0%', delivered: 0, cancelled: 0, total: 0 },
        { name: 'Carrybee', rate: '0%', delivered: 0, cancelled: 0, total: 0 },
        { name: 'RedX', rate: '0%', delivered: 0, cancelled: 0, total: 0 }
      ],
      attribution: [
        { k: 'Primary source', v: 'first_visit' }, { k: 'Channel', v: 'Web' },
        { k: 'Traffic source', v: 'Direct' }, { k: 'Confidence', v: 'Medium' }
      ],
      session: [
        { k: 'Duration', v: '1 min' }, { k: 'Page views', v: '1' },
        { k: 'Visitor', v: 'Returning' }, { k: 'Landing page', v: '/' }
      ],
      device: [
        { k: 'Device', v: 'Desktop' }, { k: 'Browser', v: 'Safari 26' },
        { k: 'Platform', v: 'macOS' }, { k: 'Resolution', v: '1512×779' },
        { k: 'Language', v: 'en-US' }
      ],
      location: [
        { k: 'Country', v: 'Bangladesh' }, { k: 'Region', v: 'Dhaka Division' },
        { k: 'City', v: 'Dhaka' }, { k: 'ZIP', v: '1230' },
        { k: 'Coordinates', v: '23.7104, 90.4074' }
      ],
      activity: [
        { icon: 'shopping-bag', title: 'Order created by customer', meta: '7 Sep 2026, 8:48 PM · online store checkout' },
        { icon: 'shield-check', title: 'Fraud check completed — low risk', meta: '7 Sep 2026, 8:48 PM · automated' },
        { icon: 'mail', title: 'Order confirmation email sent', meta: '7 Sep 2026, 8:49 PM · to nusrat@example.com' },
        { icon: 'phone-call', title: 'Auto call queued for confirmation', meta: '7 Sep 2026, 8:50 PM · attempt 1 of 3' }
      ]
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea{font-family:inherit}
.dc-h233:hover{border-color:#94a3b8 !important}
.dc-h234:hover{border-color:#94a3b8 !important}
.dc-h235:hover{border-color:#94a3b8 !important}
.dc-h236:hover{background:#002a77 !important}
.dc-h237:hover{border-color:#f97362 !important}
.dc-h238:hover{border-color:#94a3b8 !important}
.dc-h239:hover{background:rgba(255,255,255,.9) !important}
.dc-h240:hover{border-color:#94a3b8 !important}
.dc-h241:hover{border-color:#94a3b8 !important}
.dc-h242:hover{border-color:#94a3b8 !important}
.dc-h243:hover{border-color:#94a3b8 !important}`;

// ---- markup ----

export default class OrderDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="OrderDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ display: "flex", gap: "12px", padding: "12px", height: "100vh", boxSizing: "border-box", overflow: "hidden", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="orders-delivered" />
          <div style={{ flex: "1", minWidth: "0", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc", overflowY: "auto" }}>
            <__Topbar crumb="Orders / All orders" page="Order details" />
            <header style={{ flex: "none", position: "sticky", top: "64px", zIndex: "90", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", padding: "12px 24px", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
              <__Link className="dc-h233" href="/merchant-orders" style={{ display: "inline-flex", height: "34px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#475569" }}><__Icon name="arrow-left" strokeWidth="1.75" width="16" height="16" />All orders</__Link>
              <h1 style={{ margin: "0", fontSize: "20px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a" }}>Order #136779</h1>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.12)", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#9a5b00" }}>Pending</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,87,36,.12)", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#b8330f" }}>Unpaid</span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Placed 7 Sep 2026, 8:48 PM · Online store</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="dc-h234" style={{ display: "inline-flex", height: "34px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="phone-call" strokeWidth="1.75" width="16" height="16" />Auto call</button>
                <button className="dc-h235" style={{ width: "34px", height: "34px", display: "grid", placeItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#475569", cursor: "pointer" }} aria-label="Print invoice">
                  <__Icon name="printer" strokeWidth="1.75" width="16" height="16" />
                </button>
                <button className="dc-h236" style={{ display: "inline-flex", height: "34px", alignItems: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 14px", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}><__Icon name="receipt" strokeWidth="1.75" width="16" height="16" />Print POS</button>
              </div>
            </header>
            <main style={{ padding: "28px 32px 40px", display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "26px", maxWidth: "1440px", margin: "0 auto" }}>
              <div style={{ display: "grid", gap: "16px", minWidth: "0", flex: "3 1 520px" }}>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#334155" }}>Order status</h2>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>Track the current fulfilment stage</p>
                    </div>
                    <button className="dc-h237" style={{ display: "inline-flex", height: "32px", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#b8330f", cursor: "pointer" }}>Quick block</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "8px", marginTop: "18px" }}>
                    <div>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "9999px", background: "rgba(16,185,129,.12)", color: "#047857", display: "grid", placeItems: "center" }}>
                          <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ flex: "1", height: "3px", borderRadius: "9999px", background: "#10b981" }} />
                      </span>
                      <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Ordered</p>
                      <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#94a3b8" }}>2 minutes ago</p>
                    </div>
                    <div>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "9999px", background: "rgba(255,152,0,.12)", color: "#9a5b00", display: "grid", placeItems: "center" }}>
                          <__Icon name="clock" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ flex: "1", height: "3px", borderRadius: "9999px", background: "#e2e8f0" }} />
                      </span>
                      <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Approved</p>
                      <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#94a3b8" }}>Awaiting confirmation</p>
                    </div>
                    <div>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "9999px", background: "#e9eef5", color: "#94a3b8", display: "grid", placeItems: "center" }}>
                          <__Icon name="truck" strokeWidth="1.75" width="16" height="16" />
                        </span>
                        <span style={{ flex: "1", height: "3px", borderRadius: "9999px", background: "#e2e8f0" }} />
                      </span>
                      <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>Ready to ship</p>
                      <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#94a3b8" }}>No courier yet</p>
                    </div>
                    <div>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "32px", height: "32px", flex: "none", borderRadius: "9999px", background: "#e9eef5", color: "#94a3b8", display: "grid", placeItems: "center" }}>
                          <__Icon name="package-check" strokeWidth="1.75" width="16" height="16" />
                        </span>
                      </span>
                      <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>Delivered</p>
                      <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#94a3b8" }}>—</p>
                    </div>
                  </div>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
                    <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#334155" }}>Order items<span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", background: "rgba(0,48,135,.1)", padding: "0 9px", fontSize: "12px", fontWeight: "600", color: "#003087" }}>2 items</span></h2>
                    <button className="dc-h238" style={{ display: "inline-flex", height: "32px", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />Update items</button>
                  </div>
                  <div style={{ padding: "16px 24px", display: "grid", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                      <svg viewBox="0 0 48 48" style={{ width: "48px", height: "48px", flex: "none", borderRadius: "8px", background: "#e9eef5" }}>
                        <defs>
                          <pattern id="odA" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect width="3" height="6" fill="#cbd5e1" />
                          </pattern>
                        </defs>
                        <rect width="48" height="48" fill="url(#odA)" />
                      </svg>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#003087" }}>Shockproof Bumper Matte Kickstand Case — 16 Pro Max</span>
                        <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#94a3b8" }}>SKU-29349600 · Magnetic armor cover · ৳1,000</span>
                      </span>
                      <span style={{ display: "inline-flex", height: "26px", flex: "none", alignItems: "center", borderRadius: "8px", background: "#e9eef5", padding: "0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>× 1</span>
                      <span style={{ width: "88px", flex: "none", textAlign: "right", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳1,000</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                      <svg viewBox="0 0 48 48" style={{ width: "48px", height: "48px", flex: "none", borderRadius: "8px", background: "#e9eef5" }}>
                        <rect width="48" height="48" fill="url(#odA)" />
                      </svg>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#003087" }}>Tempered Glass Screen Protector — 2 pack</span>
                        <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#94a3b8" }}>SKU-50478265 · Clear · ৳0 (gift)</span>
                      </span>
                      <span style={{ display: "inline-flex", height: "26px", flex: "none", alignItems: "center", borderRadius: "8px", background: "#e9eef5", padding: "0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>× 1</span>
                      <span style={{ width: "88px", flex: "none", textAlign: "right", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳0</span>
                    </div>
                  </div>
                  <div style={{ padding: "0 28px 18px" }}>
                    <h3 style={{ margin: "6px 0 8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}><__Icon name="badge-dollar-sign" strokeWidth="1.75" width="16" height="16" />Payment summary</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span>Product price <span style={{ color: "#94a3b8" }}>(2 items)</span></span>
                      <span style={{ fontWeight: "500", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳1,000</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span>Discount</span>
                      <span style={{ fontWeight: "500", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳0</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span>Shipping <span style={{ color: "#94a3b8" }}>(inside Dhaka)</span></span>
                      <span style={{ fontWeight: "500", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳70</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "13px" }}>
                      <span>Paid by customer</span>
                      <span style={{ fontWeight: "500", color: "#334155", fontVariantNumeric: "tabular-nums" }}>৳0</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "14px 16px", marginTop: "10px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#003087" }}>Total due</span>
                      <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-.025em", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,070</span>
                    </div>
                  </div>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#334155" }}><__Icon name="shield-check" strokeWidth="1.75" width="17" height="17" />Admin management</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>1 lifetime order from this phone number · currently 1 pending</p>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", marginTop: "14px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div>
                        <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Courier delivery history</p>
                        <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#94a3b8" }}>Fraud check across connected couriers for 01553-336655</p>
                      </div>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#54617a" }}>Total 0 parcels</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px", marginTop: "12px" }}>
                      <div style={{ borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "10px 12px" }}>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", color: "#003087" }}>Ordered</p>
                        <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>0</p>
                      </div>
                      <div style={{ borderRadius: "8px", background: "rgba(16,185,129,.08)", padding: "10px 12px" }}>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", color: "#047857" }}>Delivered</p>
                        <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>0</p>
                        <p style={{ margin: "0", fontSize: "11px", color: "#94a3b8" }}>0% success</p>
                      </div>
                      <div style={{ borderRadius: "8px", background: "rgba(255,87,36,.08)", padding: "10px 12px" }}>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", color: "#b8330f" }}>Cancelled</p>
                        <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>0</p>
                        <p style={{ margin: "0", fontSize: "11px", color: "#94a3b8" }}>0% of total</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginTop: "10px" }}>
                      {__list(v.couriers).map((c, $index) => (<React.Fragment key={$index}>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{c?.name}</span>
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>{c?.rate}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                              <span>Deliv.<span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155" }}>{c?.delivered}</span></span>
                              <span>Canc.<span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155" }}>{c?.cancelled}</span></span>
                              <span>Total<span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155" }}>{c?.total}</span></span>
                            </div>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", borderRadius: "12px", background: "#f1f5f9", padding: "5px", marginTop: "16px" }}>
                    {__list(v.actions).map((a, $index) => (<React.Fragment key={$index}>
                        {a?.onApprove ? (<>
                          <button onClick={a?.onClick} style={{ flex: "1 1 120px", height: "36px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>{a?.label}</button>
                        </>) : null}
                        {a?.onHold ? (<>
                          <button onClick={a?.onClick} style={{ flex: "1 1 120px", height: "36px", border: "none", borderRadius: "8px", background: "#9a5b00", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>{a?.label}</button>
                        </>) : null}
                        {a?.onCancel ? (<>
                          <button onClick={a?.onClick} style={{ flex: "1 1 120px", height: "36px", border: "none", borderRadius: "8px", background: "#b8330f", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>{a?.label}</button>
                        </>) : null}
                        {a?.onDelivered ? (<>
                          <button onClick={a?.onClick} style={{ flex: "1 1 120px", height: "36px", border: "none", borderRadius: "8px", background: "#047857", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>{a?.label}</button>
                        </>) : null}
                        {a?.off ? (<>
                          <button className="dc-h239" onClick={a?.onClick} style={{ flex: "1 1 120px", height: "36px", border: "none", borderRadius: "8px", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>{a?.label}</button>
                        </>) : null}
                      </React.Fragment>))}
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginTop: "12px" }}>
                    <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>{v.panelTitle}</p>
                    <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#94a3b8" }}>{v.panelHint}</p>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Delivery address<input defaultValue="House 14, Road 7, Sector 4, Uttara, Dhaka 1230" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }} /></label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px", marginTop: "12px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", gridColumn: "1/-1" }}>Ship from<select defaultValue="Central Warehouse, Tejgaon — default · both items in stock" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }}>
  <option>Central Warehouse, Tejgaon — default · both items in stock</option>
  <option>Dhanmondi branch — both items in stock</option>
  <option>Mirpur branch — 1 of 2 items in stock</option>
  <option>Chattogram hub — for Chattogram addresses</option>
</select><span style={{ display: "block", marginTop: "5px", fontSize: "12px", fontWeight: "400", color: "#64748b" }}>Online orders ship from Central Warehouse. If an item is out of stock there, the nearest branch that has every item is picked instead. Change it here for this order only.</span></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Zone<select style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }}>
  <option>Inside Dhaka — ৳70</option>
  <option>Sub-Dhaka — ৳110</option>
  <option>Outside Dhaka — ৳150</option>
</select></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Courier<select style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }}>
  <option>Steadfast</option>
  <option>Pathao</option>
  <option>Carrybee</option>
  <option>RedX</option>
</select></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Shipping charge<input defaultValue="70" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }} /></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Discount<input defaultValue="0" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }} /></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Delivery date<input type="date" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }} /></label>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Advance collected<input placeholder="0" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b" }} /></label>
                    </div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginTop: "12px" }}>Note to courier<textarea rows="2" placeholder="Call before delivery, 3rd floor" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b", resize: "vertical" }} /></label>
                    {v.ctaApprove ? (<>
                      <button style={{ width: "100%", height: "44px", border: "none", borderRadius: "8px", background: "#003087", marginTop: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Approve order</button>
                    </>) : null}
                    {v.ctaHold ? (<>
                      <button style={{ width: "100%", height: "44px", border: "none", borderRadius: "8px", background: "#9a5b00", marginTop: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Hold order</button>
                    </>) : null}
                    {v.ctaCancel ? (<>
                      <button style={{ width: "100%", height: "44px", border: "none", borderRadius: "8px", background: "#b8330f", marginTop: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Cancel order</button>
                    </>) : null}
                    {v.ctaDelivered ? (<>
                      <button style={{ width: "100%", height: "44px", border: "none", borderRadius: "8px", background: "#047857", marginTop: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Mark as delivered</button>
                    </>) : null}
                  </div>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#334155" }}><__Icon name="activity" strokeWidth="1.75" width="17" height="17" />Tracking details</h2>
                    <button onClick={v.toggleTracking} style={{ border: "none", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#003087", cursor: "pointer" }}>{v.trackingToggle}</button>
                  </div>
                  {v.trackingOpen ? (<>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "12px", marginTop: "14px" }}>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>{"Attribution & campaign"}</p>
                        {__list(v.attribution).map((r, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "5px 0", fontSize: "13px" }}>
                              <span style={{ color: "#94a3b8" }}>{r?.k}</span>
                              <span style={{ fontWeight: "500", color: "#334155" }}>{r?.v}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Session</p>
                        {__list(v.session).map((r, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "5px 0", fontSize: "13px" }}>
                              <span style={{ color: "#94a3b8" }}>{r?.k}</span>
                              <span style={{ fontWeight: "500", color: "#334155" }}>{r?.v}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>{"Device & browser"}</p>
                        {__list(v.device).map((r, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "5px 0", fontSize: "13px" }}>
                              <span style={{ color: "#94a3b8" }}>{r?.k}</span>
                              <span style={{ fontWeight: "500", color: "#334155" }}>{r?.v}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Location</p>
                        {__list(v.location).map((r, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "5px 0", fontSize: "13px" }}>
                              <span style={{ color: "#94a3b8" }}>{r?.k}</span>
                              <span style={{ fontWeight: "500", color: "#334155" }}>{r?.v}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", marginTop: "12px" }}>
                      <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Technical</p>
                      <p style={{ margin: "0", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", lineHeight: "1.7", color: "#697a9b", wordBreak: "break-all" }}>session mtrcuaaz_tnkavpyh2 · fingerprint 468b95801620759a535e8b4b62f8589ba83c416b1aabd33bd99373b9dd6a42ca · created 7 Sep 2026, 8:48:22 PM</p>
                    </div>
                  </>) : null}
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "600", letterSpacing: ".025em", color: "#334155" }}><__Icon name="history" strokeWidth="1.75" width="17" height="17" />Activity</h2>
                    <button style={{ border: "none", background: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#003087", cursor: "pointer" }}>Add a comment</button>
                  </div>
                  <div style={{ marginTop: "14px", display: "grid", gap: "2px" }}>
                    {__list(v.activity).map((e, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "#e9eef5", color: "#54617a", display: "grid", placeItems: "center" }}>
                            <__Icon name={e?.icon} strokeWidth="1.75" width="15" height="15" />
                          </span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{e?.title}</span>
                            <span style={{ display: "block", fontSize: "12px", color: "#94a3b8" }}>{e?.meta}</span>
                          </span>
                        </div>
                      </React.Fragment>))}
                  </div>
                </section>
              </div>
              <aside style={{ display: "grid", gap: "16px", minWidth: "0", flex: "1 1 300px", maxWidth: "400px", alignContent: "start" }}>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ width: "44px", height: "44px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "15px", fontWeight: "600" }}>NJ</span>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>Nusrat Jahan</span>
                      <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", color: "#003087" }}>01553-336655</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#94a3b8" }}>First-time buyer · 1 order</span>
                    </span>
                    <span style={{ display: "inline-flex", gap: "4px", flex: "none" }}>
                      <button style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "1px solid #f9c8bf", borderRadius: "8px", background: "#fff", color: "#b8330f", cursor: "pointer" }} aria-label="Block customer">
                        <__Icon name="ban" strokeWidth="1.75" width="15" height="15" />
                      </button>
                      <button style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#475569", cursor: "pointer" }} aria-label="Edit customer">
                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                      </button>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
                    <button className="dc-h240" style={{ flex: "1", height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Call</button>
                    <button className="dc-h241" style={{ flex: "1", height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>WhatsApp</button>
                    <button className="dc-h242" style={{ flex: "1", height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>SMS</button>
                  </div>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}><__Icon name="map-pin" strokeWidth="1.75" width="16" height="16" />Shipping address</h2>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#047857" }}>Inside Dhaka</span>
                  </div>
                  <p style={{ margin: "12px 0 0", borderRadius: "8px", background: "#f8fafc", padding: "12px", fontSize: "13px", lineHeight: "1.6", color: "#475569" }}>House 14, Road 7, Sector 4<br />Uttara, Dhaka 1230<br />Bangladesh</p>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}><__Icon name="shield-check" strokeWidth="1.75" width="16" height="16" />Order verification</h2>
                    <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "9999px", background: "#10b981", padding: "0 10px", fontSize: "12px", fontWeight: "600", color: "#fff" }}>Low risk</span>
                  </div>
                  <div style={{ borderRadius: "8px", background: "#f8fafc", padding: "12px", marginTop: "12px" }}>
                    <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#334155" }}>Dhaka, Dhaka Division, BD</p>
                    <p style={{ margin: "2px 0 0", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#94a3b8" }}>104.28.117.2 · Cloudflare AS13335</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "8px", marginTop: "10px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><__Icon name="monitor" strokeWidth="1.75" width="14" height="14" />Desktop</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><__Icon name="globe" strokeWidth="1.75" width="14" height="14" />Direct</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #f9c8bf", borderRadius: "8px", background: "rgba(255,87,36,.06)", padding: "8px 10px", fontSize: "12px", fontWeight: "600", color: "#b8330f" }}><__Icon name="timer" strokeWidth="1.75" width="14" height="14" />1 min session</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", fontWeight: "500", color: "#475569" }}><__Icon name="repeat" strokeWidth="1.75" width="14" height="14" />Returning</span>
                  </div>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}><__Icon name="sticky-note" strokeWidth="1.75" width="16" height="16" />Notes</h2>
                  <label style={{ display: "block", marginTop: "12px", fontSize: "12px", fontWeight: "600", color: "#047857" }}>Order note<textarea rows="2" placeholder="Visible to courier and on the invoice" style={{ width: "100%", boxSizing: "border-box", border: "1px solid rgba(16,185,129,.35)", borderRadius: "8px", background: "rgba(16,185,129,.05)", padding: "10px 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b", resize: "vertical" }} /></label>
                  {" "}
                  <label style={{ display: "block", marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#475569" }}>Internal note<textarea rows="2" placeholder="Only staff can read this" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", padding: "10px 12px", marginTop: "5px", fontSize: "13px", color: "#1e293b", resize: "vertical" }} /></label>
                </section>
                <section style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "18px 20px" }}>
                  <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}><__Icon name="tag" strokeWidth="1.75" width="16" height="16" />Tags</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#54617a" }}>high-value</span>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", borderRadius: "9999px", background: "#e9eef5", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#54617a" }}>call-first</span>
                  </div>
                  <input placeholder="Type a tag and press Enter" style={{ width: "100%", boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", marginTop: "10px", fontSize: "13px", color: "#1e293b" }} />
                  {" "}
                  <button className="dc-h243" style={{ width: "100%", height: "36px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#fff", marginTop: "10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>+ Create task</button>
                </section>
              </aside>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
