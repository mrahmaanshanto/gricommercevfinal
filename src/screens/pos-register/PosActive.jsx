'use client';
// Generated from design/templates/pos-register/PosActive.dc.html by scripts/convert-design.mjs.
// PosActive
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
  renderVals() {
    // PosOffline embeds this screen with `offline`, so the header shows the real device state
    const offline = !!this.props.offline;
    const status = offline
      ? [{ label: 'Offline', icon: 'cloud-off', dot: '#ff5724' }, { label: 'Printer offline', icon: 'printer', dot: '#ff5724' }, { label: 'Drawer open', icon: 'inbox', dot: '#ff5724' }]
      : [{ label: 'Online', icon: 'wifi', dot: '#10b981' }, { label: 'Printer', icon: 'printer', dot: '#10b981' }, { label: 'Drawer closed', icon: 'inbox', dot: '#64748b' }];
    return { offline, status };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = POS_CSS + `input,select{box-sizing:border-box}
html,body{height:100%}
@keyframes scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}@keyframes scanringdark{0%,100%{box-shadow:0 0 0 3px rgba(0,156,222,.5)}50%{box-shadow:0 0 0 5px rgba(0,156,222,.28)}}
.dc-h244:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h245:hover{background:#e9eef5 !important}
.dc-h246:hover{background:#e9eef5 !important}
.dc-h247:hover{background:#e9eef5 !important}
.dc-h248:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h249:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h250:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h251:hover{background:rgba(203,213,225,.2) !important}
.dc-h252:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h253:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h254:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h255:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h256:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h257:hover{border-color:#99acd0 !important}
.dc-h258:hover{border-color:#99acd0 !important}
.dc-h259:hover{border-color:#99acd0 !important}
.dc-h260:hover{border-color:#99acd0 !important}
.dc-h261:hover{border-color:#99acd0 !important}
.dc-h262:hover{border-color:#99acd0 !important}
.dc-h263:hover{border-color:#99acd0 !important}
.dc-h264:hover{border-color:#99acd0 !important}
.dc-h265:hover{border-color:#99acd0 !important}
.dc-h266:hover{border-color:#99acd0 !important}
.dc-h267:hover{border-color:#99acd0 !important}
.dc-h268:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h269:hover{background:#f1f5f9 !important}
.dc-h270:hover{background:#f1f5f9 !important}
.dc-h271:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h272:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h273:hover{background:#f1f5f9 !important}
.dc-h274:hover{background:#f1f5f9 !important}
.dc-h275:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h276:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h277:hover{background:#f1f5f9 !important}
.dc-h278:hover{background:#f1f5f9 !important}
.dc-h279:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h280:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h281:hover{background:#f1f5f9 !important}
.dc-h282:hover{background:#f1f5f9 !important}
.dc-h283:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h284:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h285:hover{background:#f1f5f9 !important}
.dc-h286:hover{background:#f1f5f9 !important}
.dc-h287:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h288:hover{border-color:#99acd0 !important;background:#f8fafc !important}
.dc-h289:hover{background:#f1f5f9 !important}
.dc-h290:hover{background:#f1f5f9 !important}
.dc-h291:hover{background:rgba(255,87,36,.12) !important;color:#c2380f !important}
.dc-h292:hover{color:#1e293b !important}
.dc-h293:hover{background:#eef2f7 !important}
.dc-h294:hover{background:#eef2f7 !important}
.dc-h295:hover{background:#eef2f7 !important}
.dc-h296:hover{background:#eef2f7 !important}
.dc-h297:hover{background:#eef2f7 !important}
.dc-h298:hover{background:#e2e8f0 !important}
.dc-h299:hover{background:#e2e8f0 !important}
.dc-h300:hover{background:rgba(255,87,36,.1) !important}
.dc-h301:hover{background:rgba(0,48,135,.2) !important}
.dc-h302:hover{background:#002a77 !important}`;

// ---- markup ----

export default class PosActiveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosActive">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div className={"gc-shell pos-root" + (this.props.embedded ? " pos-root--embedded" : "") + (this.state.cartOpen ? " is-cart-open" : "")} style={{ fontFamily: "var(--font-sans)", color: "#475569" }}>
          <__Sidebar collapsed="" fill="" active="pos" />
          <div className="gc-shell__main pos-main" style={{ background: "#f8fafc" }}>
            <header className="pos-head">
              <button type="button" className="dc-h244 pos-head__nav" aria-label="Open navigation" onClick={this.toggleNav} style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <__Icon name="panel-left" width="20" height="20" strokeWidth="1.75" />
              </button>
              <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap" }}>Point of sale</h1>
              <span className="pos-head__sep" style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <div className="pos-status" role="group" aria-label="Device status" style={{ display: "flex", alignItems: "center", gap: "0", height: "30px", borderRadius: "var(--radius-full)", background: v.offline ? "rgba(255,87,36,.12)" : "#f1f5f9", padding: "0 4px", whiteSpace: "nowrap" }}>
                {v.status.map((st, i) => (<React.Fragment key={st.label}>
                    {i > 0 && <span style={{ width: "1px", height: "14px", background: v.offline ? "rgba(255,87,36,.35)" : "#cbd5e1" }} />}
                    <span title={st.label} style={{ position: "relative", display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: v.offline ? "var(--text-danger)" : "#475569" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: st.dot }} /><__Icon name={st.icon} strokeWidth="1.75" width="14" height="14" /><span className="pos-label">{st.label}</span></span>
                  </React.Fragment>))}
              </div>
              <div className="pos-head__actions">
                <button type="button" className="dc-h245 pos-head__act" title="Held sales" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Held sales</span><span style={{ display: "inline-flex", height: "18px", minWidth: "18px", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", background: "#003087", padding: "0 5px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#fff" }}>3</span></button>
                <button type="button" className="dc-h246 pos-head__act" title="Recent sales" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="receipt-text" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Recent sales</span></button>
                <button type="button" className="dc-h247 pos-head__act" title="Exchange / return" style={{ display: "inline-flex", height: "44px", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="16" height="16" /><span className="pos-label">Exchange / return</span></button>
                <span className="pos-head__sep" style={{ width: "1px", height: "24px", background: "#e2e8f0", margin: "0 2px" }} />
                <span className="pos-head__lang" role="group" aria-label="Language" style={{ display: "flex", padding: "2px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                  <button type="button" aria-pressed="true" lang="en" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>EN</button>
                  <button type="button" aria-pressed="false" lang="bn" style={{ height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "none", padding: "0 14px", fontFamily: "var(--font-bn)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>বাংলা</button>
                </span>
                <button type="button" className="dc-h248 pos-head__apps" aria-label="Apps" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="layout-grid" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button type="button" className="dc-h249 pos-head__bell" aria-label="Notifications" style={{ position: "relative", width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="bell" width="20" height="20" strokeWidth="1.75" />
                  <span style={{ position: "absolute", top: "11px", right: "12px", width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#ff5724", border: "1.5px solid #fff" }} />
                </button>
                <button type="button" className="dc-h250 pos-head__dark" aria-label="Dark mode" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <__Icon name="moon" width="20" height="20" strokeWidth="1.75" />
                </button>
                <button type="button" className="dc-h251 pos-head__profile" aria-label="Account: Rahim Uddin" style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", border: "none", borderRadius: "var(--radius-full)", background: "none", padding: "0 8px 0 4px", fontFamily: "inherit", cursor: "pointer" }}>
                  <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RU</span>
                  <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </header>
            <div className="pos-context" role="group" aria-label="Sale context">
              <button type="button" className="dc-h252" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="warehouse" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Warehouse</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Central Warehouse</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h253" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="store" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Counter</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Gulshan-1 · Counter 2</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h254" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="calculator" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Register</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>REG-02 · open 9:02 AM</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h255" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="user-round" strokeWidth="1.75" width="16" height="16" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Cashier</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Rahim Uddin — Super Admin</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
              <button type="button" className="dc-h256" style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", flex: "none", whiteSpace: "nowrap", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>SA</span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", lineHeight: "1.4" }}>Customer</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", lineHeight: "1.35" }}>Shirin Akter — +8801811843300</span>
                </span>
                <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="pos-body">
              <main className="pos-products">
                {this.props.banner}
                <div style={{ flex: "none", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <span style={{ position: "relative", display: "block", flex: "1 1 200px", minWidth: "0" }}>
                    <input aria-label="Search products by name, SKU or brand" defaultValue="charger" placeholder="Search products by name, SKU or brand" style={{ width: "100%", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px 0 40px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <__Icon name="search" strokeWidth="1.75" width="18" height="18" />
                    </span>
                  </span>
                  <select aria-label="Category" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All categories</option>
                    <option>Apparel</option>
                    <option>Accessories</option>
                  </select>
                  <select aria-label="Brand" style={{ height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", backgroundColor: "#fff", padding: "0 34px 0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%)", backgroundPosition: "calc(100% - 17px) 21px,calc(100% - 12px) 21px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat" }}>
                    <option>All brands</option>
                    <option>Samsung</option>
                    <option>Xiaomi</option>
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
                <div className="pos-grid">
                  <button type="button" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>P</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>120 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Baseus USB-C Cable 100W 1m</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Black · 1m</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳780.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h257" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>64 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Screen Cleaning Kit</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Spray · 50ml</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳165.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h258" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>54 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Tempered Glass 9H</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Universal 6.7 inch</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳390.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h259" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>T</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>42 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Spigen Tough Armor Case · Galaxy A55</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Black · M</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳1,240.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h260" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Low · 6 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Samsung 25W Fast Charger</span>
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
                  <button type="button" className="dc-h261" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>D</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>88 in stock</span>
                      <span style={{ position: "absolute", top: "6px", right: "6px", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>1</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Lightning Cable 1m</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Anti-dandruff</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff" }}>
                        <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h262" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>B</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>12 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Budget Android Phone</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Midnight Black · 128GB</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳14,990.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h263" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>C</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)" }}>Out of stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Xiaomi Smart Band 8</span>
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
                  <button type="button" className="dc-h264" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>S</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>31 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Foldable Phone Stand</span>
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
                  <button type="button" className="dc-h265" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>M</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>26 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>USB-C OTG Adapter</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Silver</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳340.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h266" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>A</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.14)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>73 in stock</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Camera Lens Protector</span>
                    {" "}
                    <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Clear</span>
                    {" "}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087", fontVariantNumeric: "tabular-nums" }}>৳150.00</span>
                      <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <__Icon name="plus" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                  </button>
                  <button type="button" className="dc-h267" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <span style={{ position: "relative", display: "block", height: "104px", borderRadius: "var(--radius-lg)", background: "#eef2f7", overflow: "hidden" }}>
                      <span aria-hidden="true" style={{ position: "absolute", inset: "0", display: "grid", placeItems: "center", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#a9b8d4" }}>R</span>
                      <span style={{ position: "absolute", top: "6px", left: "6px", display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.16)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Low · 4 left</span>
                    </span>
                    {" "}
                    <span style={{ display: "block", marginTop: "8px", minHeight: "36px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Anker Power Bank 10000mAh</span>
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
                  <span>Accessories · “charger” · 12 matches</span>
                </div>
              </main>
              <button type="button" className="pos-cartbar" ref={this.cartBar} aria-expanded={this.state.cartOpen} onClick={this.openCart}>
                <__Icon name="shopping-cart" strokeWidth="1.75" width="18" height="18" />
                <span>View cart · 9 items</span>
                <span className="pos-cartbar__total">৳5,220.60</span>
                <__Icon name="chevron-up" strokeWidth="1.75" width="18" height="18" />
              </button>
              <aside className="pos-cart" aria-label="Current sale" onKeyDown={this.onCartKey}>
                <div className="pos-cart__sheethead">
                  <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>Current sale</h2>
                  <button type="button" ref={this.cartClose} aria-label="Close cart" onClick={this.closeCart} style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <__Icon name="x" strokeWidth="1.75" width="20" height="20" />
                  </button>
                </div>
                <div style={{ flex: "none", padding: "12px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ position: "relative", display: "block" }}>
                    <input className="pos-scan" aria-label="Scan barcode or type SKU" placeholder="Scan barcode or type SKU" style={{ width: "100%", height: "48px", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 116px 0 42px", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#1e293b", animation: "scanring 2.6s ease-in-out infinite" }} />
                    <span style={{ position: "absolute", left: "0", top: "0", width: "42px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087" }}>
                      <__Icon name="scan-line" strokeWidth="1.75" width="20" height="20" />
                    </span>
                    <span className="pos-scanbadge" style={{ position: "absolute", right: "10px", top: "12px", display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="crosshair" strokeWidth="1.75" width="13" height="13" />Auto-focused</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "7px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "var(--radius-full)", background: "#10b981" }} />Scanner ready</span>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>ORD-20260907-0001</span>
                  </div>
                </div>
                <div style={{ flex: "1 1 auto", minHeight: "190px", position: "relative", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0" }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Line items</span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>6 lines · 9 units</span>
                    </span>
                    <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", gap: "5px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", whiteSpace: "nowrap" }}><__Icon name="arrow-up" strokeWidth="1.75" width="12" height="12" />2 above</span>
                  </div>
                  <div role="list" aria-label="Line items" tabIndex={0} style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="dc-h268 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>T</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Spigen Tough Armor Case · Galaxy A55</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Black · M · ৳1,240.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h269" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button type="button" className="dc-h270" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳2,480.00</span>
                      <button type="button" className="dc-h271" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h272 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>P</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Baseus USB-C Cable 100W 1m</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Black · 1m · ৳780.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h273" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button type="button" className="dc-h274" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,560.00</span>
                      <button type="button" className="dc-h275" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h276 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>D</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Lightning Cable 1m</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Anti-dandruff · ৳420.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h277" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button type="button" className="dc-h278" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳420.00</span>
                      <button type="button" className="dc-h279" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h280 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>C</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Screen Cleaning Kit</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Spray · 50ml · ৳165.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h281" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>2</span>
                        <button type="button" className="dc-h282" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳330.00</span>
                      <button type="button" className="dc-h283" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h284 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>S</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Foldable Phone Stand</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Brushed steel · ৳650.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h285" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button type="button" className="dc-h286" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳650.00</span>
                      <button type="button" className="dc-h287" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div className="dc-h288 pos-line" role="listitem" style={{ flex: "none", display: "flex", alignItems: "center", columnGap: "10px", padding: "6px 6px 6px 10px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", flex: "none", borderRadius: "var(--radius-lg)", background: "#eef2f7", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#a9b8d4" }}>A</span>
                      <span className="pos-line__name" style={{ display: "block", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Camera Lens Protector</span>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Clear · ৳150.00</span>
                      </span>
                      <span className="pos-line__qty" style={{ display: "flex", alignItems: "center", gap: "2px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <button type="button" className="dc-h289" aria-label="Decrease quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="minus" strokeWidth="1.75" width="16" height="16" /></button>
                        <span style={{ minWidth: "26px", textAlign: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                        <button type="button" className="dc-h290" aria-label="Increase quantity" style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" /></button>
                      </span>
                      <span className="pos-line__total" style={{ flex: "none", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳150.00</span>
                      <button type="button" className="dc-h291" aria-label="Remove line" style={{ width: "44px", height: "44px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                  </div>
                  <span style={{ position: "absolute", left: "14px", right: "14px", top: "32px", height: "14px", background: "linear-gradient(#fff,rgba(255,255,255,0))", pointerEvents: "none" }} />
                </div>
                <div className="pos-discount" role="group" aria-label="Discount and coupon" style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ flex: "none", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Discount</span>
                  <span role="group" aria-label="Discount type" style={{ flex: "none", display: "flex", height: "50px", padding: "3px", borderRadius: "var(--radius-lg)", background: "#e9eef5" }}>
                    <button type="button" aria-label="Discount in taka" aria-pressed="true" style={{ width: "44px", border: "none", borderRadius: "var(--radius-md)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", boxShadow: "0 1px 2px rgba(48,46,56,.1)" }}>৳</button>
                    <button type="button" className="dc-h292" aria-label="Discount in percent" aria-pressed="false" style={{ width: "44px", border: "none", borderRadius: "var(--radius-md)", background: "none", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", cursor: "pointer" }}>%</button>
                  </span>
                  <input defaultValue="100.00" aria-label="Discount amount" inputMode="decimal" style={{ flex: "1 1 80px", minWidth: "0", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }} />
                  <input placeholder="Coupon code" aria-label="Coupon code" style={{ width: "118px", flex: "1 1 118px", minWidth: "0", height: "44px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#1e293b" }} />
                  <button type="button" style={{ flex: "none", height: "44px", padding: "0 14px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", whiteSpace: "nowrap" }}>Apply</button>
                </div>
                <div style={{ flex: "none", position: "relative", borderTop: "1px solid #e2e8f0", padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
                    <span className="dc-h293" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>Subtotal · 9 units<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>৳5,590.00</span>
                    </span>
                    <span className="dc-h294" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>Promotion<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳248.00</span>
                    </span>
                    <span className="dc-h295" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>Manual discount<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳100.00</span>
                    </span>
                    <span className="dc-h296" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>Coupon<span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#1e293b" }}>EIDSAVE10</span><__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳150.00</span>
                    </span>
                    <span className="dc-h297" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "#f8fafc" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>Loyalty · 240 pts<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-success)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>− ৳120.00</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "rgba(0,48,135,.08)", outline: "1px solid rgba(0,48,135,.18)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b", whiteSpace: "nowrap" }}>Tax · 5% VAT<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "#003087", flex: "none" }} /></span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>＋ ৳248.60</span>
                    </span>
                    <span style={{ gridColumn: "1/-1", display: "flex", alignItems: "flex-start", gap: "7px", padding: "6px 9px", borderRadius: "var(--radius-md)", background: "#f8fafc", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}><__Icon name="info" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)", flex: "none", marginTop: "2px" }} />Tax: 5% VAT on ৳4,972.00 taxable — subtotal less every discount. Repair lines are zero-rated.</span>
                  </div>
                  <div style={{ height: "1px", background: "#e2e8f0" }} />
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569" }}>Payment taken<__Icon name="info" strokeWidth="1.75" width="12" height="12" style={{ color: "var(--text-muted)" }} /><span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳0.00</span></span>
                      <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-warning)" }}>Due <span style={{ fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span></span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}>Total due</span>
                      <span style={{ fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>৳5,220.60</span>
                    </span>
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
                    <button type="button" className="dc-h298" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="16" height="16" />New sale</button>
                    <button type="button" className="dc-h299" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", cursor: "pointer" }}><__Icon name="pause" strokeWidth="1.75" width="16" height="16" />Hold sale</button>
                    <button type="button" className="dc-h300" style={{ flex: "1", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "none", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-danger)", cursor: "pointer" }}>Cancel sale</button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" className="dc-h301" style={{ flex: "1", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", whiteSpace: "nowrap" }}>Take payment<span className="pos-kbd" style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#fff", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Alt+P</span></button>
                    <button type="button" className="dc-h302" style={{ flex: "1.2", height: "52px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 3px 10px 0 rgba(0,48,135,.24)" }}>Complete sale<span className="pos-kbd" style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.2)", padding: "0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>F4</span></button>
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
