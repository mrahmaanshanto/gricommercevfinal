'use client';
// Generated from design/templates/landing-page-builder/LandingPageBuilder.dc.html by scripts/convert-design.mjs.
// LandingPageBuilder — Single-product landing page builder — product picker, section library, drag-and-drop canvas with live mobile preview, per-field AI copy generation, COD order form settings and the publish checklist.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { screen: props.screen === 'product' ? 'pick' : (props.screen === 'publish' ? 'publish' : 'build'), device: props.device === 'desktop' ? 'desktop' : 'mobile', ai: props.aiPanel === true };
  }
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  renderVals() {
    const s = this.state;
    return {
      isPick: s.screen === 'pick',
      isBuild: s.screen === 'build' || s.screen === 'publish',
      isPublish: s.screen === 'publish',
      isMobile: s.device !== 'desktop',
      isDesktop: s.device === 'desktop',
      aiOpen: s.ai === true,
      aiClosed: s.ai !== true,
      startBuild: () => this.setState({ screen: 'build' }),
      backToPick: () => this.setState({ screen: 'pick' }),
      openPublish: () => this.setState({ screen: 'publish' }),
      closePublish: () => this.setState({ screen: 'build' }),
      openAiField: () => this.setState({ ai: true }),
      openAiPage: () => this.setState({ screen: 'build', ai: true }),
      closeAi: () => this.setState({ ai: false }),
      setMobile: () => this.setState({ device: 'mobile' }),
      setDesktop: () => this.setState({ device: 'desktop' }),
      // Only the Winter blanket has a sample page, so the other products explain that instead of silently doing nothing.
      pickOther: (name) => () => __toast(name + ' has no sample page in this demo. Winter blanket stays selected.', { tone: 'info' }),
      selHeroFn: () => this.setState({ ai: false }),
      selPriceFn: () => this.setState({ ai: false }),
      selDeliveryFn: () => this.setState({ ai: false }),
      selFormFn: () => this.setState({ ai: false })
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea,button{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}.bn{font-family:var(--font-bn)}
.dc-h15:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h16:hover{background:#dde5ef !important}
.dc-h17:hover{background:#dde5ef !important}
.dc-h18:hover{background:#dde5ef !important}
.dc-h19:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h20:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h21:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h22:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h23:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h24:hover{border-color:#94a3b8 !important;background:#f8fafc !important}
.dc-h25:hover{background:#002a77 !important}
.dc-h26:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h27:hover{background:rgba(203,213,225,.2) !important}
.dc-h28:hover{background:rgba(0,156,222,.22) !important}
.dc-h29:hover{background:rgba(0,48,135,.2) !important}
.dc-h30:hover{background:#002a77 !important}
.dc-h31:hover{background:#dde5ef !important}
.dc-h32:hover{background:#dde5ef !important}
.dc-h33:hover{background:#dde5ef !important}
.dc-h34:hover{background:#dde5ef !important}
.dc-h35:hover{background:#dde5ef !important}
.dc-h36:hover{background:#dde5ef !important}
.dc-h37:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h38:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h39:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h40:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h41:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h42:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h43:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h44:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h45:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h46:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h47:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h48:hover{border-color:#cbd5e1 !important}
.dc-h49:hover{border-color:#cbd5e1 !important}
.dc-h50:hover{border-color:#cbd5e1 !important}
.dc-h51:hover{border-color:#cbd5e1 !important}
.dc-h52:hover{border-color:#cbd5e1 !important}
.dc-h53:hover{border-color:#cbd5e1 !important}
.dc-h54:hover{border-color:#cbd5e1 !important}
.dc-h55:hover{border-color:#94a3b8 !important}
.dc-h56:hover{border-color:#cbd5e1 !important}
.dc-h57:hover{border-color:#cbd5e1 !important}
.dc-h58:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h59:hover{border-color:#009cde !important}
.dc-h60:hover{border-color:#009cde !important}
.dc-h61:hover{border-color:#009cde !important}
.dc-h62:hover{border-color:#009cde !important}
.dc-h63:hover{background:rgba(0,156,222,.22) !important}
.dc-h64:hover{background:#dde5ef !important}
.dc-h65:hover{background:var(--accent-fill) !important;color:#fff !important}
.dc-h66:hover{background:var(--accent-fill) !important;color:#fff !important}
.dc-h67:hover{background:#dde5ef !important}
.dc-h68:hover{background:#dde5ef !important}
.dc-h69:hover{background:#dde5ef !important}
.dc-h70:hover{background:rgba(255,87,36,.2) !important}
.dc-h71:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h72:hover{background:#dde5ef !important}
.dc-h73:hover{background:#dde5ef !important}
.dc-h74:hover{background:#dde5ef !important}
.dc-h75:hover{background:#dde5ef !important}
.dc-h76:hover{background:#dde5ef !important}
.dc-h77:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h78:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h79:hover{background:#002a77 !important}
.dc-h80:hover{background:#dde5ef !important}
.dc-h81:hover{background:#f1f5f9 !important}
.dc-h82:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h83:hover{background:rgba(255,255,255,.6) !important}
.dc-h84:hover{background:rgba(255,255,255,.6) !important}
.dc-h85:hover{background:rgba(0,156,222,.22) !important}
.dc-h86:hover{background:#dde5ef !important}
.dc-h87:hover{background:#002a77 !important}
.dc-h88:hover{background:rgba(0,48,135,.2) !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
.mg-row[aria-pressed="true"]{cursor:default}
.lpb-phone{max-width:100%}
/* the editor toolbar wraps whenever its buttons don't fit (at 1440 with the side menu, Publish was cut off) */
.lpb-head{height:auto!important;min-height:72px;flex-wrap:wrap;row-gap:8px;padding-top:12px!important;padding-bottom:12px!important}
@media (max-width:1379px){.lpb-work{min-width:0!important;flex-wrap:wrap}.lpb-settings{flex:1 1 100%!important;width:auto!important;border-left:0!important;border-top:1px solid #e2e8f0}.lpb-head{height:auto!important;min-height:72px;flex-wrap:wrap;row-gap:8px;padding:12px 16px!important}.lpb-head>*{max-width:100%}.lpb-head h1{white-space:normal!important}}
@media (max-width:1023px){.lpb-work{flex-direction:column;flex-wrap:nowrap}.lpb-work>*{flex:none!important;width:100%!important;min-width:0!important;border-right:0!important;border-bottom:1px solid #e2e8f0}.lpb-pick{padding:20px 16px 32px!important}}
/* phones: the editor toolbar wraps inside the screen (view switch full width, then Open on my phone + Publish);
   icon buttons and the page-part rows get touch-sized targets */
@media (max-width:640px){
  .lpb-ib{width:44px!important;height:44px!important}
  .lpb-ib svg{width:20px;height:20px}
  .lpb-tools{flex:1 1 100%!important;flex-wrap:wrap;margin-left:0!important}
  .lpb-tools>span:first-child{flex:1 1 100%!important}
  .lpb-tools>span:first-child>button{flex:1 1 0!important;justify-content:center;height:36px!important}
  .lpb-tools>button{flex:1 1 0!important;justify-content:center;height:44px!important}
  .lpb-cbar{flex-wrap:wrap;row-gap:6px!important}
  .lpb-cbar>span:last-child{flex:1 1 100%!important;margin-left:0!important;white-space:normal!important}
  .lpb-parts button{min-height:44px}
  .lpb-parts button>span:last-child:not([style*="flex: 1"]){display:grid;place-items:center;width:40px;height:40px;margin:-8px -6px -8px 0;flex:none}
  .lpb-parts button>span svg{width:16px;height:16px}
}`;

// ---- markup ----

export default class LandingPageBuilderScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="LandingPageBuilder">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar collapsed="" sticky="" active="storefront-pages" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", position: "relative", overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            {v.isPick ? (<>
              <__Topbar crumb="Marketing" page="Landing pages" />
              <header className="mg-head" style={{ display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "12px", padding: "0 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <button className="dc-h15" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Back to landing pages">
                  <__Icon name="arrow-left" width="20" height="20" strokeWidth="1.75" />
                </button>
                <div>
                  <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>New landing page</h1>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Step 1 of 2 — pick the product this page sells</p>
                </div>
              </header>
              <div className="lpb-pick" style={{ flex: "1", minHeight: "0", padding: "32px 32px 40px" }}>
                <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 372px", gap: "26px", maxWidth: "1240px" }}>
                  <section style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Your products</h2>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>240 in catalogue</span>
                      <span style={{ position: "relative", display: "inline-block", width: "250px", marginLeft: "auto" }}>
                        <input aria-label="Search products or SKU" type="search" placeholder="Search products or SKU…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                        <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                          <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Recently added</button>
                      <button className="dc-h16" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Best selling</button>
                      <button className="dc-h17" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>In stock</button>
                      <button className="dc-h18" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>No page yet</button>
                    </div>
                    <div style={{ marginTop: "16px", display: "grid", gap: "8px" }}>
                      <button type="button" className="mg-row" aria-pressed="true" style={{ display: "flex", gap: "12px", alignItems: "center", border: "2px solid #003087", borderRadius: "var(--radius-lg)", padding: "10px 12px", background: "rgba(0,48,135,.04)", cursor: "pointer" }}>
                        <span style={{ flex: "none", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "rgba(0,48,135,.08)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>WB</span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Winter blanket — 4kg</span>
                          <span style={{ display: "block", margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳1,290 · was ৳1,590 · 3 variants · 42 in stock · 18 reviews</span>
                        </span>
                        <span style={{ flex: "none", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff" }}>
                          <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button type="button" className="mg-row dc-h19" aria-pressed="false" onClick={v.pickOther("Hair oil 200ml")} style={{ display: "flex", gap: "12px", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ flex: "none", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "rgba(0,156,222,.1)", color: "var(--accent-text)", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>HO</span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Hair oil 200ml</span>
                          <span style={{ display: "block", margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳540 · 1 variant · <span style={{ color: "#c23a12", fontWeight: "var(--weight-medium)" }}>0 in stock</span></span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,87,36,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c23a12" }}>Out of stock</span>
                      </button>
                      <button type="button" className="mg-row dc-h20" aria-pressed="false" onClick={v.pickOther("Kids hoodie")} style={{ display: "flex", gap: "12px", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ flex: "none", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "rgba(16,185,129,.1)", color: "#0f7a5a", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>KH</span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Kids hoodie</span>
                          <span style={{ display: "block", margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳890 · 4 variants · 128 in stock</span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>1 page</span>
                      </button>
                      <button type="button" className="mg-row dc-h21" aria-pressed="false" onClick={v.pickOther("Jamdani saree")} style={{ display: "flex", gap: "12px", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ flex: "none", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "rgba(255,152,0,.12)", color: "#a15f00", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>JS</span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Jamdani saree</span>
                          <span style={{ display: "block", margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>৳4,750 · 6 variants · 11 in stock</span>
                        </span>
                        <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(255,152,0,.12)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#a15f00" }}>Low stock</span>
                      </button>
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>A landing page always sells a product from your catalogue, so price, stock and variants stay correct by themselves. <a href="#">Add a new product</a></p>
                  </section>
                  <aside style={{ display: "grid", gap: "16px", alignContent: "start" }}>
                    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                      <h2 style={{ margin: "0 0 2px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Fills the page automatically</h2>
                      <p style={{ margin: "0 0 14px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Winter blanket — 4kg</p>
                      <div style={{ display: "grid", gap: "9px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="type" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Name</b> — heading, page title, order confirmation</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="image" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>4 photos</b> — hero, gallery and variant images</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="tag" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>৳1,290, was ৳1,590</b> — price part and order total</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="percent" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>20% off</b> — offer part and savings line</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="layers" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>3 sizes</b> — variant chips and order form</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="boxes" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>42 in stock</b> — urgency part and maximum quantity</span>
                        </div>
                      </div>
                      <p style={{ margin: "14px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Change these in the product, not on the page. <a href="#">Edit product</a></p>
                    </div>
                    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                      <h2 style={{ margin: "0 0 2px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Starting point</h2>
                      <p style={{ margin: "0 0 14px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Step 2 of 2 — every template arrives already filled in</p>
                      <div style={{ display: "grid", gap: "8px" }}>
                        <button onClick={v.startBuild} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.04)", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                            <__Icon name="banknote" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>COD single product</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>11 parts · order form near the top</span>
                          </span>
                        </button>
                        <button className="dc-h22" onClick={v.startBuild} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="scroll-text" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Long-form offer</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>17 parts · benefits, reviews, FAQ, countdown</span>
                          </span>
                        </button>
                        <button className="dc-h23" onClick={v.startBuild} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="play-circle" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Video first</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>9 parts · video, then order form</span>
                          </span>
                        </button>
                        <button className="dc-h24" onClick={v.startBuild} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="plus" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Blank page</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Start with 3 suggested parts</span>
                          </span>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "16px" }}>
                        <button className="dc-h25" onClick={v.startBuild} style={{ height: "36px", flex: "1", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Start building</button>
                        <select aria-label="Page language" style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <option>বাংলা + English</option>
                          <option>বাংলা</option>
                          <option>English</option>
                        </select>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </>) : null}
            {v.isBuild ? (<>
              <header className="lpb-head" style={{ display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "10px", padding: "0 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", minWidth: "0" }}>
                <button className="dc-h26 lpb-ib" onClick={v.backToPick} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Back to landing pages">
                  <__Icon name="arrow-left" width="20" height="20" strokeWidth="1.75" />
                </button>
                <div style={{ flex: "none" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap" }}>Winter blanket — landing page</h1>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>gridcommerce.shop/rina/winter-blanket</p>
                </div>
                <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", letterSpacing: "var(--tracking-wide)" }}>Draft</span>
                <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />Saved · <span className="bn" style={{ fontSize: "var(--text-xs-plus)" }}>সেভ হয়েছে</span></span>
                <div style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                  <button className="dc-h27 lpb-ib" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", cursor: "pointer" }} aria-label="Undo">
                    <__Icon name="undo-2" strokeWidth="1.75" width="18" height="18" />
                  </button>
                  <button className="lpb-ib" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#cbd5e1", cursor: "not-allowed" }} aria-label="Redo" disabled>
                    <__Icon name="redo-2" strokeWidth="1.75" width="18" height="18" />
                  </button>
                </div>
                <button className="dc-h28" onClick={v.openAiPage} style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="15" height="15" />Write page with AI</button>
                <div className="lpb-tools" style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "none", display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                    {v.isMobile ? (<>
                      <button onClick={v.setMobile} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />Mobile</button>
                      {" "}
                      <button onClick={v.setDesktop} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="monitor" strokeWidth="1.75" width="14" height="14" />Desktop</button>
                    </>) : null}
                    {v.isDesktop ? (<>
                      <button onClick={v.setMobile} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />Mobile</button>
                      {" "}
                      <button onClick={v.setDesktop} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="monitor" strokeWidth="1.75" width="14" height="14" />Desktop</button>
                    </>) : null}
                  </span>
                  <button className="dc-h29" style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="qr-code" strokeWidth="1.75" width="15" height="15" />Open on my phone</button>
                  <button className="dc-h30" onClick={v.openPublish} style={{ flex: "none", whiteSpace: "nowrap", height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 16px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="rocket" strokeWidth="1.75" width="16" height="16" />Publish</button>
                </div>
              </header>
              <div className="lpb-work" style={{ flex: "1", minHeight: "0", display: "flex", minWidth: "1240px" }}>
                <section className="lpb-lib" aria-label="Add a part" style={{ width: "236px", flex: "none", flexShrink: "0", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "14px 14px 10px" }}>
                    <h2 style={{ margin: "0 0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Add a part</h2>
                    <span style={{ position: "relative", display: "block" }}>
                      <input aria-label="Search parts" type="search" placeholder="Search parts…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 12px 0 34px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                      <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "34px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                        <__Icon name="search" strokeWidth="1.75" width="15" height="15" />
                      </span>
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Product</button>
                      <button className="dc-h31" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Conversion</button>
                      <button className="dc-h32" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Social proof</button>
                      <button className="dc-h33" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Offers</button>
                      <button className="dc-h34" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Checkout</button>
                      <button className="dc-h35" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Information</button>
                      <button className="dc-h36" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>My parts</button>
                    </div>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", borderTop: "1px solid #e2e8f0", padding: "10px 10px 16px" }}>
                    <p style={{ margin: "2px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Product · 6</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h37" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Hero / product intro</button>
                      <button className="dc-h38" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Image gallery</button>
                      <button className="dc-h39" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Product benefits</button>
                      <button className="dc-h40" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Features / specifications</button>
                      <button className="dc-h41" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Video</button>
                      <div style={{ display: "flex", gap: "9px", alignItems: "center", borderRadius: "var(--radius-lg)", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}><span>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Variant selection<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)" }}>on page</span></div>
                    </div>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Conversion · 5</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h42" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Why buy this product</button>
                      <button className="dc-h43" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Before / after</button>
                      <button className="dc-h44" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Stock urgency</button>
                    </div>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Social proof · 1</p>
                    <button className="dc-h45" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Customer reviews</button>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Offers · 4</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h46" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Bundle / quantity discount</button>
                      <button className="dc-h47" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Related / upsell product</button>
                    </div>
                    <div style={{ marginTop: "16px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Drag a part onto the page, or tap it to add below the selected part.</p>
                    </div>
                  </div>
                </section>
                <section className="lpb-parts" aria-label="Page parts" style={{ width: "222px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Page parts</h2>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>11</span>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "0 10px 16px" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h48" onClick={v.selHeroFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hero / product intro</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h49" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Image gallery</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button onClick={v.selPriceFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer" }}>
                        <span style={{ color: "#003087", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"Price & offer"}</span>
                        <span>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h50" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Variant selection</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h51" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Product benefits</span>
                        <span style={{ color: "#a15f00" }}>
                          <__Icon name="alert-circle" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", borderTop: "2px dashed #009cde", padding: "5px 2px 2px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>Drop here — Customer reviews</div>
                      <button className="dc-h52" onClick={v.selDeliveryFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Delivery charge</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h53" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cash on delivery</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h54" onClick={v.selFormFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Order form</span>
                        <span style={{ color: "var(--text-muted)" }} title="Required — can be hidden, not deleted">
                          <__Icon name="lock" strokeWidth="1.75" width="13" height="13" />
                        </span>
                      </button>
                      <button className="dc-h55" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", cursor: "pointer" }}>
                        <span style={{ cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Countdown · hidden</span>
                        <span>
                          <__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h56" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>FAQ</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h57" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Footer / contact</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                      <button className="dc-h58" style={{ flex: "1", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />Add part</button>
                    </div>
                    <p style={{ margin: "12px 4px 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Drag to reorder, or use <__Icon name="chevron-up" strokeWidth="1.75" width="12" height="12" />{" "}<__Icon name="chevron-down" strokeWidth="1.75" width="12" height="12" /> on a part. Hidden parts keep their settings.</p>
                  </div>
                </section>
                <section className="lpb-canvas" aria-label="Page preview" style={{ flex: "1", minWidth: "430px", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
                  <div className="lpb-cbar" style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                    <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />Edit mode</span>
                    <span style={{ flex: "1 1 auto", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Tap any part on the page to change it</span>
                    <span style={{ marginLeft: "auto", flex: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />390 px · what 94% of your buyers see</span>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", display: "flex", justifyContent: "center", padding: "20px 16px 40px" }}>
                    <div className="lpb-phone" style={{ width: "390px", flex: "none", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "26px", padding: "0 12px", background: "#f8fafc", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
                        <span>9:41</span>
                        <span>rina.gridcommerce.shop</span>
                      </div>
                      <button type="button" className="mg-row dc-h59" aria-label="Edit part: Photos and headline" onClick={v.selHeroFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ display: "block", height: "150px", borderRadius: "var(--radius-lg)", background: "repeating-linear-gradient(115deg,#f8fafc,#f8fafc 10px,#eef2f7 10px,#eef2f7 20px)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>product photo 1 of 4</span>
                        <span className="bn" style={{ display: "block", margin: "12px 0 0", fontSize: "var(--text-xl)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", color: "#1e293b", letterSpacing: "0" }}>শীতের জন্য নরম, আরামদায়ক কম্বল</span>
                        <span style={{ display: "block", margin: "5px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Winter blanket — 4kg, king size</span>
                      </button>
                      <div style={{ position: "relative", border: "2px solid #003087", margin: "8px", borderRadius: "var(--radius-xl)", padding: "12px", background: "rgba(0,48,135,.03)" }}>
                        <span style={{ position: "absolute", top: "-11px", left: "10px", display: "inline-flex", alignItems: "center", gap: "6px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", padding: "0 4px 0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Price & offer\n"}<span style={{ display: "inline-flex", gap: "1px", marginLeft: "3px" }}>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="grip-vertical" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="eye" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="copy" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="more-vertical" strokeWidth="1.75" width="11" height="11" />
  </span>
</span></span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", letterSpacing: "var(--tracking-tight)" }}>৳1,290</span>
                          <span style={{ fontSize: "var(--text-sm-plus)", color: "var(--text-muted)", textDecoration: "line-through" }}>৳1,590</span>
                          <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(240,0,185,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c1008f" }}>20% off</span>
                        </div>
                        <p className="bn" style={{ margin: "6px 0 0", fontSize: "var(--text-sm-plus)", color: "#475569" }}>২০% ছাড় — আজকের অর্ডারে ৳৩০০ সেভ</p>
                      </div>
                      <button type="button" className="mg-row dc-h60" aria-label="Edit part: Size and quantity" onClick={v.selPriceFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span className="bn" style={{ display: "block", margin: "0 0 8px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>সাইজ বাছুন</span>
                        <span style={{ display: "block", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", height: "32px", alignItems: "center", border: "1px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Double</span>
                          <span style={{ display: "inline-flex", height: "32px", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 12px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Semi-double</span>
                          <span style={{ display: "inline-flex", height: "32px", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "0 12px", fontSize: "var(--text-xs-plus)", color: "#cbd5e1", textDecoration: "line-through" }}>Single</span>
                        </span>
                        <span style={{ display: "block", display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                          <span className="bn" style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>পরিমাণ</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "4px 10px", fontSize: "var(--text-sm)", color: "#1e293b" }}><span style={{ display: "inline-flex", color: "var(--text-muted)" }}><__Icon name="minus" strokeWidth="2" width="14" height="14" aria-hidden="true" /></span>1<span style={{ display: "inline-flex", color: "#003087" }}><__Icon name="plus" strokeWidth="2" width="14" height="14" aria-hidden="true" /></span></span>
                          <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "#a15f00" }}>স্টক শেষ হয়ে যাচ্ছে — ৪২টি বাকি</span>
                        </span>
                      </button>
                      <button type="button" className="mg-row dc-h61" aria-label="Edit part: Delivery and payment" onClick={v.selDeliveryFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "#475569" }}>
                          <span className="bn">ডেলিভারি চার্জ — ঢাকার ভিতরে</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>৳70</span>
                        </span>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "4px" }}>
                          <span className="bn">ঢাকার বাইরে</span>
                          <span>৳130</span>
                        </span>
                        <span style={{ display: "block", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.1)", padding: "8px 10px" }}>
                          <span style={{ color: "#0f7a5a" }}>
                            <__Icon name="hand-coins" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span className="bn" style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", color: "#0f7a5a" }}>ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন</span>
                        </span>
                      </button>
                      <button type="button" className="mg-row dc-h62" aria-label="Edit part: Order form" onClick={v.selFormFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span className="bn" style={{ display: "block", margin: "0 0 10px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>অর্ডার করতে নিচের তথ্য দিন</span>
                        <span style={{ display: "block", display: "grid", gap: "7px" }}>
                          <span style={{ display: "block", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">আপনার নাম *</span>
                          <span style={{ display: "block", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">মোবাইল নম্বর * — 01XXXXXXXXX</span>
                          <span style={{ display: "block", height: "52px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start", padding: "8px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">সম্পূর্ণ ঠিকানা *</span>
                          <span style={{ display: "block", display: "flex", gap: "7px" }}>
                            <span style={{ display: "block", flex: "1", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#475569" }} className="bn">ঢাকা<span style={{ color: "var(--text-muted)" }}>
  <__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" />
</span></span>
                            <span style={{ display: "block", flex: "1", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">এলাকা</span>
                          </span>
                        </span>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>
                          <span className="bn">সর্বমোট</span>
                          <span>৳1,360</span>
                        </span>
                        <span style={{ display: "block", marginTop: "10px", height: "46px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }} className="bn">অর্ডার কনফার্ম করুন</span>
                        <span style={{ display: "block", margin: "8px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center" }}>4 fields · no account · no OTP</span>
                      </button>
                      <div style={{ border: "1px dashed #cbd5e1", margin: "8px", borderRadius: "var(--radius-xl)", padding: "14px", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>FAQ · Footer / contact · WhatsApp button</div>
                      <div style={{ position: "sticky", bottom: "0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>৳1,360</span>
                        <span className="bn" style={{ flex: "1", height: "40px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>অর্ডার করুন</span>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="lpb-settings" aria-label="Part settings" style={{ width: "340px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderLeft: "1px solid #e2e8f0" }}>
                  {v.aiClosed ? (<>
                    <div style={{ flex: "none", padding: "14px 16px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Price & offer"}</h2>
                        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "var(--radius-sm)", background: "rgba(0,156,222,.12)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}><__Icon name="link" strokeWidth="1.75" width="12" height="12" />auto from product</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>৳1,290 · was ৳1,590 · 20% off — change these in the product</p>
                      <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                        <button className="dc-h63" onClick={v.openAiField} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="14" height="14" />Fill this part with AI</button>
                        <button className="dc-h64" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="14" height="14" />Reset</button>
                      </div>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "14px 16px 24px" }}>
                      <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-offer-line">Offer line</label>
                      <div style={{ position: "relative", marginTop: "6px" }}>
                        <textarea id="lpb-offer-line" aria-describedby="lpb-offer-help" rows="2" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "8px 42px 8px 10px", fontSize: "var(--text-sm)", lineHeight: "1.45", color: "#1e293b", resize: "vertical" }} className="bn" defaultValue={"২০% ছাড় — আজকের অর্ডারে ৳৩০০ সেভ"} />
                        <button className="dc-h65" onClick={v.openAiField} style={{ position: "absolute", top: "6px", right: "6px", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #009cde", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--accent-text)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="11" height="11" />AI</button>
                      </div>
                      <p style={{ margin: "5px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }} id="lpb-offer-help">Shown under the price. Keep it under 8 words on mobile.</p>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-price-note">Note under price</label>
                      <div style={{ position: "relative", marginTop: "6px" }}>
                        <input id="lpb-price-note" defaultValue="ডেলিভারি চার্জ আলাদা" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 42px 0 10px", fontSize: "var(--text-sm)", color: "#1e293b" }} className="bn" />
                        <button className="dc-h66" onClick={v.openAiField} style={{ position: "absolute", top: "7px", right: "6px", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #009cde", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--accent-text)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="11" height="11" />AI</button>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <span>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Show the old price</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>৳1,590 struck through</span>
                        </span>
                        <span style={{ flex: "none", width: "40px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 3px" }}>
                          <span style={{ width: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                        </span>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", marginBottom: "7px" }}>Savings shown as</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>৳300 saved</button>
                        <button className="dc-h67" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>20% off</button>
                        <button className="dc-h68" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Both</button>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Price, stock and variants have no AI</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>They come straight from your product so a buyer can never see a wrong price.</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
                        <button className="dc-h69" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="bookmark" strokeWidth="1.75" width="14" height="14" />Save to my parts</button>
                        <button className="dc-h70" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", color: "#c23a12", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide part</button>
                      </div>
                    </div>
                  </>) : null}
                  {v.aiOpen ? (<>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)" }}>
                        <__Icon name="sparkles" strokeWidth="1.75" width="16" height="16" />
                      </span>
                      <div style={{ minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI · Offer line</h2>
                        <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{"Price & offer part"}</p>
                      </div>
                      <button className="dc-h71" onClick={v.closeAi} style={{ marginLeft: "auto", width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close AI">
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "14px 16px 24px" }}>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "10px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Your text now</p>
                        <p className="bn" style={{ margin: "0", fontSize: "var(--text-sm)", color: "#475569" }}>২০% ছাড় — আজকের অর্ডারে ৳৩০০ সেভ</p>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "12px" }}>
                        <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Rewrite</button>
                        <button className="dc-h72" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Generate</button>
                        <button className="dc-h73" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Shorten</button>
                        <button className={`bn dc-h74`} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>বাংলা</button>
                        <button className="dc-h75" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>English</button>
                        <button className={`bn dc-h76`} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>বাংলা + English</button>
                      </div>
                      <p style={{ margin: "12px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Using your product: Winter blanket · ৳1,290 · 20% off · 3 sizes · 42 in stock · 18 reviews</p>
                      <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                        <button style={{ textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.04)", padding: "10px", cursor: "pointer" }}>
                          <span className="bn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>আজকের অর্ডারে ৳৩০০ সেভ — ২০% ছাড়</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "#003087", fontWeight: "var(--weight-medium)" }}>Shown on the page now · 6 words</span>
                        </button>
                        <button className="dc-h77" style={{ textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px", cursor: "pointer" }}>
                          <span className="bn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>২০% ছাড়ে ৳১,২৯০ — শীত শেষ হওয়ার আগেই</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8 words</span>
                        </button>
                        <button className="dc-h78" style={{ textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px", cursor: "pointer" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>Save ৳300 today — 20% off the 4kg blanket</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>English · 8 words</span>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
                        <button className="dc-h79" onClick={v.closeAi} style={{ height: "36px", flex: "1", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Use this text</button>
                        <button className="dc-h80" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="14" height="14" />Again</button>
                        <button className="dc-h81" onClick={v.closeAi} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Keep mine</button>
                      </div>
                      <div style={{ marginTop: "16px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Nothing changes on your page until you tap <b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Use this text</b> — and undo brings your words back.</p>
                      </div>
                      <p style={{ margin: "14px 0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Earlier in this session</p>
                      <div style={{ display: "grid", gap: "6px" }}>
                        <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "#475569", borderLeft: "2px solid #e2e8f0", paddingLeft: "8px" }}>শীতের সেরা অফার — ২০% ছাড়</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", borderLeft: "2px solid #e2e8f0", paddingLeft: "8px" }}>20% off — limited winter stock</span>
                      </div>
                    </div>
                  </>) : null}
                </section>
              </div>
            </>) : null}
            {v.isPublish ? (<>
              <div onKeyDown={(e) => { if (e.key === "Escape") v.closePublish(); }} onMouseDown={(e) => { if (e.target === e.currentTarget) v.closePublish(); }} style={{ position: "fixed", inset: "0", zIndex: "200", background: "rgba(15,23,42,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
                <div role="dialog" aria-modal="true" aria-labelledby="lpb-publish-title" style={{ width: "560px", maxWidth: "100%", maxHeight: "calc(100dvh - 32px)", overflowY: "auto", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 20px 40px -12px rgba(15,23,42,.35)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                      <__Icon name="rocket" strokeWidth="1.75" width="18" height="18" />
                    </span>
                    <div>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }} id="lpb-publish-title">Publish this page</h2>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Two things must be fixed first</p>
                    </div>
                    <button className="dc-h82" autoFocus onClick={v.closePublish} style={{ marginLeft: "auto", width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close">
                      <__Icon name="x" strokeWidth="1.75" width="18" height="18" />
                    </button>
                  </div>
                  <div style={{ padding: "18px 20px 20px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#c23a12" }}>Must fix</p>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.08)", padding: "10px 12px" }}>
                        <span style={{ flex: "none", color: "#c23a12" }}>
                          <__Icon name="alert-circle" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>Delivery charge for <b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>outside Dhaka</b> is empty</span>
                        <button className="dc-h83" style={{ flex: "none", height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#c23a12", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Set ৳130</button>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.08)", padding: "10px 12px" }}>
                        <span style={{ flex: "none", color: "#c23a12" }}>
                          <__Icon name="link-2" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>The link <b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>/blanket</b> is already used</span>
                        <button className="dc-h84" style={{ flex: "none", height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#fff", color: "#c23a12", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Use /winter-blanket</button>
                      </div>
                    </div>
                    <p style={{ margin: "18px 0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#a15f00" }}>Worth checking — will not stop you</p>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                        <span style={{ flex: "none", color: "#a15f00" }}>
                          <__Icon name="sparkles" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>2 benefit rows are still empty</span>
                        <button className="dc-h85" style={{ flex: "none", height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Fill with AI</button>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                        <span style={{ flex: "none", color: "#a15f00" }}>
                          <__Icon name="arrow-up" strokeWidth="1.75" width="18" height="18" />
                        </span>
                        <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>Order form is 5 parts down on mobile</span>
                        <button className="dc-h86" style={{ flex: "none", height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Move it up</button>
                      </div>
                    </div>
                    <div style={{ height: "1px", background: "#e2e8f0", margin: "18px 0" }} />
                    <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-page-link">Page link</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "6px" }}>
                      <span style={{ height: "38px", display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", background: "#f8fafc", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} id="lpb-page-link-prefix">gridcommerce.shop/rina/</span>
                      <input id="lpb-page-link" aria-describedby="lpb-page-link-prefix" defaultValue="winter-blanket" style={{ flex: "1", minWidth: "0", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0", padding: "0 10px", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px" }}>
                      <button className="dc-h87" onClick={v.closePublish} style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 16px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="rocket" strokeWidth="1.75" width="16" height="16" />Publish page</button>
                      <button className="dc-h88" onClick={v.closePublish} style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 14px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="smartphone" strokeWidth="1.75" width="16" height="16" />Check on my phone first</button>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Orders go to your orders list</span>
                    </div>
                  </div>
                </div>
              </div>
            </>) : null}
          </div>
        </div>
      </div>
    );
  }
}
