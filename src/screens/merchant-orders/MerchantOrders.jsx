'use client';
// Generated from design/templates/merchant-orders/MerchantOrders.dc.html by scripts/convert-design.mjs.
// MerchantOrders — All-orders workspace — status tabs with live counts, filter bar, bulk actions, dense order table with courier and payment columns, pagination.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { tab: 'All', sel: {} };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  tone(s) {
    const t = {
      Pending: ['rgba(255,152,0,.12)', '#9a5b00'],
      Approved: ['rgba(0,48,135,.1)', '#003087'],
      'Ready to ship': ['rgba(14,165,233,.12)', '#0271a6'],
      Shipped: ['rgba(0,156,222,.12)', '#0089c3'],
      Delivered: ['rgba(16,185,129,.12)', '#047857'],
      Cancelled: ['rgba(255,87,36,.12)', '#b8330f'],
      Returned: ['#e9eef5', '#54617a']
    };
    return t[s] || ['#e9eef5', '#54617a'];
  }
  payTone(p) {
    const t = { Paid: ['rgba(16,185,129,.12)', '#047857'], Unpaid: ['rgba(255,87,36,.12)', '#b8330f'], Partial: ['rgba(255,152,0,.12)', '#9a5b00'], COD: ['#e9eef5', '#54617a'] };
    return t[p] || ['#e9eef5', '#54617a'];
  }
  renderVals() {
    const all = [
      { id: '#136779', placed: '7 Sep, 8:48 PM', channel: 'Online store', customer: 'Nusrat Jahan', initials: 'NJ', phone: '01553-336655', zone: 'Inside Dhaka', itemTitle: 'Shockproof Bumper Case — 16 Pro Max', itemMeta: '1 item · ৳1,000', courier: 'Not assigned', consignment: '—', status: 'Pending', payment: 'Unpaid', total: '৳1,070' },
      { id: '#136778', placed: '7 Sep, 7:12 PM', channel: 'Online store', customer: 'Mostafizur Rahman', initials: 'MR', phone: '01711-902244', zone: 'Chattogram', itemTitle: 'Daily Care Shampoo 400ml + 2 more', itemMeta: '3 items · ৳1,860', courier: 'Steadfast', consignment: 'SF-9920841', status: 'Ready to ship', payment: 'COD', total: '৳1,990' },
      { id: '#136776', placed: '7 Sep, 4:03 PM', channel: 'POS · Bashundhara', customer: 'Walk-in customer', initials: 'WC', phone: '—', zone: 'Inside Dhaka', itemTitle: 'Tablet 10.4" 64GB Gray', itemMeta: '1 item · ৳18,400', courier: 'Store pickup', consignment: '—', status: 'Delivered', payment: 'Paid', total: '৳18,400' },
      { id: '#136771', placed: '6 Sep, 11:40 AM', channel: 'Online store', customer: 'Tanvir Hasan', initials: 'TH', phone: '01822-771190', zone: 'Sub-Dhaka', itemTitle: 'Antibacterial Hand Wash — Lemon 500ml', itemMeta: '2 items · ৳412', courier: 'Pathao', consignment: 'PT-4471203', status: 'Shipped', payment: 'COD', total: '৳482' },
      { id: '#136764', placed: '6 Sep, 9:05 AM', channel: 'Online store', customer: 'Sadia Afrin', initials: 'SA', phone: '01966-330012', zone: 'Outside Dhaka', itemTitle: 'Budget Android Phone 6GB/128GB', itemMeta: '1 item · ৳14,900', courier: 'RedX', consignment: 'RX-1180553', status: 'Approved', payment: 'Partial', total: '৳15,030' },
      { id: '#136750', placed: '5 Sep, 6:22 PM', channel: 'Online store', customer: 'Imran Kabir', initials: 'IK', phone: '01533-889001', zone: 'Inside Dhaka', itemTitle: 'Wireless Earbuds Pro', itemMeta: '1 item · ৳2,450', courier: 'Carrybee', consignment: 'CB-7729014', status: 'Cancelled', payment: 'Unpaid', total: '৳2,510' },
      { id: '#136742', placed: '5 Sep, 1:15 PM', channel: 'Online store', customer: 'Farhana Islam', initials: 'FI', phone: '01744-556677', zone: 'Sylhet', itemTitle: 'Kitchen Blender 600W', itemMeta: '1 item · ৳3,900', courier: 'Steadfast', consignment: 'SF-9918770', status: 'Returned', payment: 'Paid', total: '৳4,030' },
      { id: '#136737', placed: '4 Sep, 10:48 AM', channel: 'Online store', customer: 'Rakib Uddin', initials: 'RU', phone: '01677-220945', zone: 'Inside Dhaka', itemTitle: 'Smart Watch Series 4 — Black', itemMeta: '1 item · ৳5,600', courier: 'Pathao', consignment: 'PT-4469881', status: 'Delivered', payment: 'Paid', total: '৳5,660' }
    ];
    const counts = { All: 696, Pending: 128, Approved: 74, 'Ready to ship': 61, Shipped: 182, Delivered: 208, Cancelled: 33, Returned: 10 };
    const keys = ['All', 'Pending', 'Approved', 'Ready to ship', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    const tab = this.state.tab;
    const rows = tab === 'All' ? all : all.filter(o => o.status === tab);
    const sel = this.state.sel;
    const selCount = rows.filter(o => sel[o.id]).length;
    const icons = { All: 'inbox', Pending: 'clock', Approved: 'check-circle-2', 'Ready to ship': 'package-check', Shipped: 'truck', Delivered: 'badge-check', Cancelled: 'x-circle', Returned: 'rotate-ccw' };
    return {
      tabs: keys.map(k => ({ label: k, count: counts[k], on: tab === k, off: tab !== k, onClick: () => this.setState({ tab: k }) })),
      navItems: keys.map(k => ({ label: k === 'All' ? 'All orders' : k, icon: icons[k], count: counts[k], on: tab === k, off: tab !== k, onClick: (e) => { if (e && e.preventDefault) e.preventDefault(); this.setState({ tab: k }); } })),
      empty: rows.length === 0,
      countLabel: 'Showing ' + rows.length + ' of ' + counts[tab] + ' ' + (tab === 'All' ? 'orders' : tab.toLowerCase() + ' orders'),
      selectionLabel: selCount ? selCount + ' selected' : 'Select rows for bulk actions',
      hasSelection: selCount > 0,
      allChecked: rows.length > 0 && selCount === rows.length,
      toggleAll: () => {
        const on = !(rows.length > 0 && selCount === rows.length);
        const next = { ...sel };
        rows.forEach(o => { next[o.id] = on; });
        this.setState({ sel: next });
      },
      clearSelection: () => this.setState({ sel: {} }),
      rows: rows.map(o => ({
        ...o,
        isPending: o.status === 'Pending',
        isApproved: o.status === 'Approved',
        isReady: o.status === 'Ready to ship',
        isShipped: o.status === 'Shipped',
        isDelivered: o.status === 'Delivered',
        isCancelled: o.status === 'Cancelled',
        isReturned: o.status === 'Returned',
        isPaid: o.payment === 'Paid',
        isUnpaid: o.payment === 'Unpaid',
        isPartial: o.payment === 'Partial',
        isCod: o.payment === 'COD',
        checked: !!sel[o.id],
        onToggle: () => this.setState(s => ({ sel: { ...s.sel, [o.id]: !s.sel[o.id] } }))
      }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}table{border-collapse:collapse}
.dc-h213:hover{background:#002a77 !important}
.dc-h214:hover{border-color:#94a3b8 !important}
.dc-h215:hover{border-color:#94a3b8 !important}
.dc-h216:hover{background:rgba(203,213,225,.25) !important}
.dc-h217:hover{border-color:#94a3b8 !important}
.dc-h218:hover{background:#f1f5f9 !important}
.dc-h219:hover{background:rgba(203,213,225,.3) !important;color:#003087 !important}
.dc-h220:hover{background:rgba(203,213,225,.3) !important;color:#475569 !important}`;

// ---- markup ----

export default class MerchantOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MerchantOrders">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ display: "flex", gap: "12px", padding: "12px", height: "100vh", boxSizing: "border-box", overflow: "hidden", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="orders-all" />
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc", overflowY: "auto" }}>
            <__Topbar crumb="Orders" page="All orders" />
            <header style={{ flex: "none", position: "sticky", top: "64px", zIndex: "90", display: "flex", flexWrap: "nowrap", overflow: "hidden", height: "72px", alignItems: "center", gap: "10px", padding: "0 32px", background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ position: "relative", display: "inline-block", flex: "1 1 160px", minWidth: "0", maxWidth: "340px" }}>
                <input type="search" placeholder="Search order ID, phone, customer…" style={{ width: "100%", height: "32px", border: "none", borderRadius: "9999px", background: "#e9eef5", padding: "0 16px 0 36px", fontFamily: "inherit", fontSize: "13px", color: "#1e293b" }} />
                <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", pointerEvents: "none" }}>
                  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                </span>
              </span>
              <div style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(16,185,129,.1)", padding: "5px 12px", fontSize: "12px", fontWeight: "600", color: "#047857" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />Live</span>
                <button className="dc-h213" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="plus" strokeWidth="1.75" width="18" height="18" />New order</button>
              </div>
            </header>
            <main style={{ padding: "28px 32px 40px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ margin: "0", fontSize: "24px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a" }}>All orders</h1>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>696 orders · ৳8,42,310 booked · updated a moment ago</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="dc-h214" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="calendar" strokeWidth="1.75" width="18" height="18" />Last 30 days</button>
                  <button className="dc-h215" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="18" height="18" />Export CSV</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "12px" }}>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#697a9b" }}>Awaiting action</p>
                    <span style={{ color: "#ff9800" }}>
                      <__Icon name="clock" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>128</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>42 unconfirmed over 6h</p>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#697a9b" }}>In courier hands</p>
                    <span style={{ color: "#009cde" }}>
                      <__Icon name="truck" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>243</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>4 couriers active</p>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#697a9b" }}>Delivery success</p>
                    <span style={{ color: "#10b981" }}>
                      <__Icon name="badge-check" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>87.4%</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>▲ 2.1% vs last month</p>
                </div>
                <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#697a9b" }}>Cash to collect</p>
                    <span style={{ color: "#003087" }}>
                      <__Icon name="wallet" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳2,14,900</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>COD across 243 parcels</p>
                </div>
              </div>
              <div style={{ borderRadius: "14px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  {__list(v.tabs).map((t, $index) => (<React.Fragment key={$index}>
                      {t?.on ? (<>
                        <button onClick={t?.onClick} style={{ display: "inline-flex", height: "32px", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#003087", cursor: "pointer" }}>{t?.label}<span style={{ fontVariantNumeric: "tabular-nums", opacity: ".75" }}>{t?.count}</span></button>
                      </>) : null}
                      {t?.off ? (<>
                        <button className="dc-h216" onClick={t?.onClick} style={{ display: "inline-flex", height: "32px", alignItems: "center", gap: "8px", border: "none", borderRadius: "9999px", background: "none", padding: "0 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{t?.label}<span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>{t?.count}</span></button>
                      </>) : null}
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <select style={{ height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", color: "#475569" }}>
                    <option>All couriers</option>
                    <option>Steadfast</option>
                    <option>Pathao</option>
                    <option>Carrybee</option>
                    <option>RedX</option>
                  </select>
                  <select style={{ height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", color: "#475569" }}>
                    <option>Any payment</option>
                    <option>Paid</option>
                    <option>Unpaid</option>
                    <option>Partially paid</option>
                  </select>
                  <select style={{ height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", color: "#475569" }}>
                    <option>All zones</option>
                    <option>Inside Dhaka</option>
                    <option>Sub-Dhaka</option>
                    <option>Outside Dhaka</option>
                  </select>
                  <button className="dc-h217" style={{ display: "inline-flex", height: "34px", alignItems: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}><__Icon name="sliders-horizontal" strokeWidth="1.75" width="15" height="15" />More filters</button>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>{v.selectionLabel}</span>
                    {v.hasSelection ? (<>
                      <span style={{ display: "inline-flex", gap: "6px" }}>
                        <button style={{ height: "34px", border: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#003087", cursor: "pointer" }}>Send to courier</button>
                        <button style={{ height: "34px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Print labels</button>
                        <button onClick={v.clearSelection} style={{ height: "34px", border: "none", borderRadius: "8px", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "13px", color: "#94a3b8", cursor: "pointer" }}>Clear</button>
                      </span>
                    </>) : null}
                  </span>
                </div>
                <div style={{ minWidth: "0", overflowX: "auto" }}>
                  <table style={{ width: "100%", minWidth: "1060px", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", width: "36px" }}>
                          <input type="checkbox" checked={v.allChecked} onChange={v.toggleAll} style={{ width: "15px", height: "15px", accentColor: "#003087" }} />
                        </th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Order</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Customer</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Items</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Courier</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Status</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b" }}>Payment</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".025em", color: "#1e293b", textAlign: "right" }}>Total</th>
                        <th style={{ background: "#e2e8f0", padding: "10px 16px", width: "56px" }} />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((o, $index) => (<React.Fragment key={$index}>
                          <tr className="dc-h218">
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              <input type="checkbox" checked={o?.checked} onChange={o?.onToggle} style={{ width: "15px", height: "15px", accentColor: "#003087" }} />
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                              <__Link href="/order-detail" style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", fontWeight: "600", color: "#003087" }}>{o?.id}</__Link>
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{o?.placed} · {o?.channel}</p>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9999px", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "600" }}>{o?.initials}</span>
                                <span>
                                  <span style={{ display: "block", color: "#1e293b" }}>{o?.customer}</span>
                                  <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#94a3b8" }}>{o?.phone} · {o?.zone}</span>
                                </span>
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ display: "block", fontSize: "13px", color: "#475569" }}>{o?.itemTitle}</span>
                              <span style={{ display: "block", fontSize: "12px", color: "#94a3b8" }}>{o?.itemMeta}</span>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ display: "block", fontSize: "13px", color: "#475569" }}>{o?.courier}</span>
                              <span style={{ display: "block", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#94a3b8" }}>{o?.consignment}</span>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              {o?.isPending ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(255,152,0,.12)", color: "#9a5b00" }}>Pending</span>
                              </>) : null}
                              {o?.isApproved ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(0,48,135,.1)", color: "#003087" }}>Approved</span>
                              </>) : null}
                              {o?.isReady ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(14,165,233,.12)", color: "#0271a6" }}>Ready to ship</span>
                              </>) : null}
                              {o?.isShipped ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(0,156,222,.12)", color: "#0089c3" }}>Shipped</span>
                              </>) : null}
                              {o?.isDelivered ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(16,185,129,.12)", color: "#047857" }}>Delivered</span>
                              </>) : null}
                              {o?.isCancelled ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#b8330f" }}>Cancelled</span>
                              </>) : null}
                              {o?.isReturned ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "#e9eef5", color: "#54617a" }}>Returned</span>
                              </>) : null}
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                              {o?.isPaid ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(16,185,129,.12)", color: "#047857" }}>Paid</span>
                              </>) : null}
                              {o?.isUnpaid ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(255,87,36,.12)", color: "#b8330f" }}>Unpaid</span>
                              </>) : null}
                              {o?.isPartial ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "rgba(255,152,0,.12)", color: "#9a5b00" }}>Partial</span>
                              </>) : null}
                              {o?.isCod ? (<>
                                <span style={{ display: "inline-flex", height: "23px", alignItems: "center", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", background: "#e9eef5", color: "#54617a" }}>COD</span>
                              </>) : null}
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "600", color: "#334155", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{o?.total}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                              <span style={{ display: "inline-flex", gap: "2px" }}>
                                <__Link className="dc-h219" href="/order-detail" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", borderRadius: "8px", color: "#94a3b8" }} aria-label="Open order">
                                  <__Icon name="eye" strokeWidth="1.75" width="16" height="16" />
                                </__Link>
                                <button className="dc-h220" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#94a3b8", cursor: "pointer" }} aria-label="More">
                                  <__Icon name="more-vertical" strokeWidth="1.75" width="16" height="16" />
                                </button>
                              </span>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.empty ? (<>
                  <p style={{ margin: "0", padding: "32px 16px", textAlign: "center", fontSize: "13px", color: "#697a9b" }}>No orders in this status right now.</p>
                </>) : null}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>{v.countLabel}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <button style={{ height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", color: "#94a3b8", cursor: "pointer" }}>Previous</button>
                    <button style={{ width: "32px", height: "32px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>1</button>
                    <button style={{ width: "32px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", color: "#475569", cursor: "pointer" }}>2</button>
                    <button style={{ width: "32px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", fontFamily: "inherit", fontSize: "13px", color: "#475569", cursor: "pointer" }}>3</button>
                    <span style={{ padding: "0 6px", fontSize: "13px", color: "#94a3b8" }}>…</span>
                    <button style={{ height: "32px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Next</button>
                  </span>
                </div>
              </div>
              <p style={{ margin: "0", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>GridCommerce · All Together. More Commerce.</p>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
