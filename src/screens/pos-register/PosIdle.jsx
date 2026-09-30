'use client';
// Generated from design/templates/pos-register/PosIdle.dc.html by scripts/convert-design.mjs.
// PosIdle
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { POS_CSS } from '@/screens/pos-register/posLayout';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  state = { cartOpen: false };
  cartBar = React.createRef();
  cartClose = React.createRef();
  // below 768px the cart is a bottom sheet opened from the "View cart" bar
  openCart = () => this.setState({ cartOpen: true }, () => this.cartClose.current && this.cartClose.current.focus());
  closeCart = () => this.setState({ cartOpen: false }, () => this.cartBar.current && this.cartBar.current.focus());
  onCartKey = (e) => { if (e.key === 'Escape' && this.state.cartOpen) { e.stopPropagation(); this.closeCart(); } };
  toggleNav = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) { window.dispatchEvent(new CustomEvent('gc:nav-toggle')); return; }
    const bar = document.querySelector('gc-sidebar');
    const btn = bar && bar.shadowRoot && bar.shadowRoot.querySelector('[data-toggle]');
    if (btn) btn.click();
  };
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = POS_CSS + `input,select{box-sizing:border-box}
html,body{height:100%}
@keyframes scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}@keyframes scanringdark{0%,100%{box-shadow:0 0 0 3px rgba(0,156,222,.5)}50%{box-shadow:0 0 0 5px rgba(0,156,222,.28)}}
.dc-h303:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h304:hover{background:#e9eef5 !important}
.dc-h305:hover{background:#e9eef5 !important}
.dc-h306:hover{background:#e9eef5 !important}
.dc-h307:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h308:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h309:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h310:hover{background:rgba(203,213,225,.2) !important}
.dc-h311:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h312:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h313:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h314:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h315:hover{border-color:#003087 !important;background:#f8fafc !important}
.dc-h316:hover{background:#e2e8f0 !important}
.dc-h317:hover{background:#e2e8f0 !important}
.dc-h318:hover{background:#e2e8f0 !important}
.dc-h319:hover{background:#e2e8f0 !important}
.dc-h320:hover{background:#e2e8f0 !important}
.dc-h321:hover{background:#e2e8f0 !important}
.dc-h322:hover{border-color:#99acd0 !important}
.dc-h323:hover{border-color:#99acd0 !important}
.dc-h324:hover{border-color:#99acd0 !important}
.dc-h325:hover{border-color:#99acd0 !important}
.dc-h326:hover{border-color:#99acd0 !important}
.dc-h327:hover{border-color:#99acd0 !important}
.dc-h328:hover{border-color:#99acd0 !important}
.dc-h329:hover{border-color:#99acd0 !important}
.dc-h330:hover{border-color:#99acd0 !important}
.dc-h331:hover{border-color:#99acd0 !important}
.dc-h332:hover{border-color:#99acd0 !important}
.dc-h333:hover{border-color:#99acd0 !important}
.dc-h334:hover{border-color:#003087 !important;background:#f8fafc !important}
.dc-h335:hover{border-color:#003087 !important;background:#f8fafc !important}
.dc-h336:hover{border-color:#003087 !important;background:#f8fafc !important}
.dc-h337:hover{background:#e2e8f0 !important}`;

// ---- markup ----

export default class PosIdleScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosIdle">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"gc-shell pos-root" + (this.props.embedded ? " pos-root--embedded" : "") + (this.state.cartOpen ? " is-cart-open" : "")} style={{ fontFamily: "var(--font-sans)", color: "#475569" }}>
          <__Sidebar collapsed="" fill="" active="pos" />
          <div className="gc-shell__main pos-main" style={{ background: "#f8fafc" }}>
            <header className="pos-head">
              <button type="button" className="dc-h303 pos-head__nav" aria-label="Open navigation" onClick={this.toggleNav} style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <__Icon name="panel-left" width="20" height="20" strokeWidth="1.75" />
              </button>
              <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap" }}>Point of sale</h1>
              <span className="pos-head__sep" style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <div className="pos-status" role="group" aria-label="Device status" style={{ display: "flex", alignItems: "center", gap: "0", height: "30px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 4px", whiteSpace: "nowrap" }}>
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: "#10b981" }} /><__Icon name="wifi" strokeWidth="1.75" width="14" height="14" /><span className="pos-label">Online</span></span>
                <span style={{ width: "1px", height: "14px", background: "#cbd5e1" }} />
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: "#10b981" }} /><__Icon name="printer" strokeWidth="1.75" width="14" height="14" /><span className="pos-label">Printer</span></span>
                <span style={{ width: "1px", height: "14px", background: "#cbd5e1" }} />
                <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: "#64748b" }} /><__Icon name="inbox" strokeWidth="1.75" width="14" height="14" /><span className="pos-label">Drawer closed</span></span>
              </div>
              <div className="pos-head__actions">
                <button type="button" className="dc-h304 pos-head__act" title="Held sales" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Held sales</span><span style={{ display: "inline-flex", height: "18px", minWidth: "18px", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", background: "#003087", padding: "0 5px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#fff" }}>3</span></button>
                <button type="button" className="dc-h305 pos-head__act" title="Recent sales" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="receipt-text" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Recent sales</span></button>
                <button type="button" className="dc-h306 pos-head__act" title="Exchange / return" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Exchange / return</span></button>
                <span className="pos-head__sep" style={{ width: "1px", height: "24px", background: "#e2e8f0", margin: "0 2px" }} />
                <span className="pos-head__lang" role="group" aria-label="Language" style={{ display: "flex", padding: "2px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                  <button type="button" aria-pressed="true" lang="en" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>EN</button>
                  <button type="button" aria-pressed="false" lang="bn" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "none", padding: "0 14px", fontFamily: "var(--font-bn)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>বাংলা</button>
                </span>
                <button type="button" className="dc-h307 pos-head__apps" aria-label="Apps" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="layout-grid" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button type="button" className="dc-h308 pos-head__bell" aria-label="Notifications" style={{ position: "relative", width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="bell" width="20" height="20" strokeWidth="1.75" />
                  <span style={{ position: "absolute", top: "11px", right: "12px", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#ff5724", border: "1.5px solid #fff" }} />
                </button>
                <button type="button" className="dc-h309 pos-head__dark" aria-label="Dark mode" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="moon" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button type="button" className="dc-h310 pos-head__profile" aria-label="Account: Rahim Uddin" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "none", padding: "0 8px 0 4px", fontFamily: "inherit", cursor: "pointer" }}>
                  <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RU</span>
                  <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </header>
            <div className="pos-context" role="group" aria-label="Sale context">
              <button type="button" className="dc-h311" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="warehouse" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Warehouse</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Central Warehouse</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h312" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="store" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Counter</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Gulshan-1 · Counter 2</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h313" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="calculator" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Register</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>REG-02 · open 9:02 AM</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h314" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="user-round" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Cashier</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Rahim Uddin — Super Admin</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h315" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "var(--text-muted)" }}>
                  <__Icon name="user-round-plus" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Customer</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", lineHeight: "1.35" }}>Add a customer</span>
                </span>
              </button>
            </div>
            <div className="pos-body">
              <main className="pos-products">
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <span style={{ position: "relative", display: "block", flex: "1 1 200px", minWidth: "0" }}>
                    <input aria-label="Search products by name, SKU or brand" placeholder="Search products by name, SKU or brand" style={{ width: "100%", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px 0 40px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <__Icon name="search" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </span>
                  <select aria-label="Category" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All categories</option>
                    <option>Apparel</option>
                    <option>Electronics</option>
                  </select>
                  <select aria-label="Brand" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All brands</option>
                    <option>Aarong</option>
                    <option>Walton</option>
                  </select>
                  <span role="group" aria-label="Product view" style={{ display: "flex", height: "50px", padding: "3px", borderRadius: "var(--radius-lg)", background: "#e9eef5", flex: "none" }}>
                    <button type="button" aria-label="Grid view" aria-pressed="true" style={{ width: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#fff", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>
                      <__Icon name="layout-grid" strokeWidth="1.75" width="18" height="18" />
                    </button>
                    <button type="button" aria-label="List view" aria-pressed="false" style={{ width: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                      <__Icon name="list" strokeWidth="1.75" width="18" height="18" />
                    </button>
                  </span>
                </div>
                <div className="pos-chips" role="group" aria-label="Quick categories" style={{ flex: "none", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button type="button" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>All products</button>
                  <button type="button" className="dc-h316" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Apparel</button>
                  <button type="button" className="dc-h317" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Electronics</button>
                  <button type="button" className="dc-h318" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Grocery</button>
                  <button type="button" className="dc-h319" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Personal care</button>
                  <button type="button" className="dc-h320" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Footwear</button>
                  <button type="button" className="dc-h321" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#334155", cursor: "pointer" }}>Home</button>
                </div>
                <div className="pos-grid">
                  <button type="button" className="dc-h322" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>T</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>42 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Premium Cotton Oversized T-Shirt</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Black · M</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h323" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Low · 6 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Compression Leggings</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Charcoal · L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,850.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h324" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>B</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>12 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Budget Android Phone</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Midnight · 128GB</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳14,990.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h325" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>D</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>88 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Daily Care Shampoo 340ml</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Anti-dandruff</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h326" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>P</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>120 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Premium Miniket Rice 5kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Sack · 5kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳780.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h327" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>64 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Chickpeas Boot Dal 1kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Loose · 1kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳165.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h328" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)" }}>Out of stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Classic White Sneakers</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>White · 42</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳3,450.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "var(--text-muted)" }}>
                        <__Icon name="ban" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h329" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>31 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Steel Water Bottle 750ml</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Brushed steel</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h330" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>54 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Soybean Cooking Oil 2L</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Bottle · 2L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳390.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h331" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>M</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>26 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Mustard Oil 1L Pure Ghani</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Bottle · 1L</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳340.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h332" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>A</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>73 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Atta Wheat Flour 2kg</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Pack · 2kg</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳150.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h333" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>R</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Low · 4 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Rice Cooker 1.8L Walton</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>White · 700W</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳3,190.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                </div>
                <div className="pos-gridfoot">
                  <span>Showing 12 of 486 products · Central Warehouse</span>
                  <span>Bangla labels run 15–25% longer — cards and chips wrap, never truncate</span>
                </div>
              </main>
              <button type="button" className="pos-cartbar" ref={this.cartBar} aria-expanded={this.state.cartOpen} onClick={this.openCart}>
                <__Icon name="shopping-cart" strokeWidth="1.75" width="18" height="18" />
                <span>View cart · 0 items</span>
                <span className="pos-cartbar__total">৳0.00</span>
                <__Icon name="chevron-up" strokeWidth="1.75" width="18" height="18" />
              </button>
              <aside className="pos-cart" aria-label="Current sale" onKeyDown={this.onCartKey}>
                <div className="pos-cart__sheethead">
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>Current sale</h2>
                  <button type="button" ref={this.cartClose} aria-label="Close cart" onClick={this.closeCart} style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
                  </button>
                </div>
                <div style={{ flex: "none", padding: "14px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ position: "relative", display: "block" }}>
                    <input className="pos-scan" aria-label="Scan barcode or type SKU" placeholder="Scan barcode or type SKU" style={{ width: "100%", height: "48px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 116px 0 42px", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#1e293b", animation: "scanring 2.6s ease-in-out infinite" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "42px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087" }}>
                      <__Icon name="scan-line" strokeWidth="1.75" width="20" height="20" />
                    </span>
                    <span className="pos-scanbadge" style={{ position: "absolute", right: "10px", top: "12px", display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="crosshair" strokeWidth="1.75" width="13" height="13" />Auto-focused</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "7px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: "#10b981" }} />Scanner ready</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Handheld gun · HID · refocuses after every sale</span>
                  </div>
                </div>
                <div style={{ flex: "1 1 auto", minHeight: "210px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "24px 28px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "54px", height: "54px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)" }}>
                    <__Icon name="scan-barcode" strokeWidth="1.75" width="26" height="26" />
                  </span>
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>No items in this sale yet</h2>
                  <p style={{ margin: "0", maxWidth: "330px", textAlign: "center", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>Scan a barcode with the gun, search the catalogue, or resume a sale parked earlier at this counter.</p>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", paddingTop: "6px" }}>
                    <button type="button" className="dc-h334" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569" }}>
  <__Icon name="scan-line" strokeWidth="1.75" width="16" height="16" />
</span>Scan a barcode<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Gun is live</span></button>
                    <button type="button" className="dc-h335" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569" }}>
  <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
</span>Search the catalogue<span style={{ marginLeft: "auto", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#f1f5f9", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>/</span></button>
                    <button type="button" className="dc-h336" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "52px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", textAlign: "left" }}><span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569" }}>
  <__Icon name="pause" strokeWidth="1.75" width="16" height="16" />
</span>Resume a held sale<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>3 parked</span></button>
                  </div>
                </div>
                <div style={{ flex: "none", borderTop: "1px solid #e2e8f0", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "7px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Subtotal · 0 items</span>
                    <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Tax</span>
                    <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                  <div style={{ height: "1px", background: "#e2e8f0", margin: "3px 0" }} />
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}>Total due</span>
                    <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>৳0.00</span>
                  </div>
                </div>
                <div className="pos-cart__actions" style={{ flex: "none", borderTop: "1px solid #e2e8f0", padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px 18px", minHeight: "24px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Require full payment" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "var(--radius-full)", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</button>Require full payment</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}><button role="switch" aria-checked="true" aria-label="Print receipt" style={{ position: "relative", display: "inline-flex", width: "40px", height: "22px", flex: "none", border: "none", borderRadius: "var(--radius-full)", background: "#003087", padding: "0", cursor: "pointer" }}>
  <span style={{ position: "absolute", left: "20px", top: "2px", width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#fff" }} />
</button>Print receipt</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" className="dc-h337" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" />New sale</button>
                    <button type="button" aria-disabled="true" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", opacity: ".5", pointerEvents: "none" }}>Hold sale</button>
                    <button type="button" aria-disabled="true" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-danger)", cursor: "pointer", opacity: ".5", pointerEvents: "none" }}>Cancel sale</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" aria-disabled="true" style={{ flex: "1", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", opacity: ".5", pointerEvents: "none" }}>Take payment<span className="pos-kbd" style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#fff", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Alt+P</span></button>
                    <button type="button" aria-disabled="true" style={{ flex: "1.2", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", opacity: ".5", pointerEvents: "none" }}>Complete sale<span className="pos-kbd" style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>F4</span></button>
                  </div>
                </div>
              </aside>
            </div>
            <button type="button" className="pos-backdrop" aria-label="Close cart" tabIndex={-1} onClick={this.closeCart} />
          </div>
        </div>
      </div>
    );
  }
}
