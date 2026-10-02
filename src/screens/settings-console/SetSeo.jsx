'use client';
// Generated from design/templates/settings-console/SetSeo.dc.html by scripts/convert-design.mjs.
// SetSeo
// Edit freely: this file is now the source for the screen.

import { SetTips as __SetTips } from './SetChrome';
import React from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { SettingsSwitcher as __SettingsSwitcher } from '@/shell/Shell';
import __SetChrome, { SettingsLogic as __SettingsLogic, SetIn as __In, SetErr as __Err, SetSaveBar as __SaveBar } from '@/screens/settings-console/SetChrome';
import __SetRail from '@/screens/settings-console/SetRail';
import __SetTopbar from '@/screens/settings-console/SetTopbar';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends __SettingsLogic {
  formId = "seo";
  fields = {
    seo_title: {l: "SEO title", d: "GridShop · Online & in-store in Bangladesh", req: true},
    meta_description: {l: "Meta description", d: "Shop electronics, home and grocery from GridShop’s Feni, Gulshan and Chattogram stores. Cash on delivery, bKash and Nagad accepted nationwide.", k: "area"},
    keywords: {l: "Keywords", d: "online shop bangladesh, bkash payment, feni electronics, grocery delivery"},
    author_name: {l: "Author name", d: "GridShop Editorial"},
    og_title: {l: "OG title", d: "GridShop"},
    og_description: {l: "OG description", d: "Order online, pay with bKash, collect in store or get it delivered nationwide.", k: "area"},
    google_analytics_id: {l: "Google Analytics ID", d: "G-4XQ7L2M9BD", check: (x) => (/^G-[A-Z0-9]{6,12}$/.test(x) ? "" : "A Google Analytics ID starts with G- followed by letters and digits, like G-4XQ7L2M9BD.")},
    facebook_pixel_id: {l: "Facebook Pixel ID", d: "418902337715640", k: "int", check: (x) => (x.length < 15 || x.length > 16 ? "A Facebook Pixel ID has 15 or 16 digits. This one has " + x.length + "." : "")},
  };
  addKeyword = () => {
    const word = String(this.state.draft || "").replace(/,/g, " ").trim().toLowerCase();
    if (!word) return;
    const list = String(this.f.get("keywords", "")).split(",").map((k) => k.trim()).filter(Boolean);
    if (!list.includes(word)) this.f.set("keywords", [...list, word].join(", "));
    this.setState({ draft: "" });
  };
  renderVals() {
    const f = this.f;
    return {
      f,
      meter: (n, max) => {
        const len = String(f.get(n, "")).length;
        return { len, pct: Math.min(100, Math.round((len / max) * 100)) + "%", color: len > max ? "#c2410c" : len > max * 0.95 ? "#ff9800" : "#10b981" };
      },
      clip: (n, max) => { const x = String(f.get(n, "")); return x.length > max ? x.slice(0, max - 1).trimEnd() + "…" : x; },
      keywords: String(f.get("keywords", "")).split(",").map((k) => k.trim()).filter(Boolean),
      draft: this.state.draft || "",
      setDraft: (e) => this.setState({ draft: e.target.value }),
            addKeyword: this.addKeyword,
      keywordKey: (e) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); this.addKeyword(); }
        else if (e.key === "Backspace" && !e.currentTarget.value) {
          const list = String(f.get("keywords", "")).split(",").map((k) => k.trim()).filter(Boolean);
          if (list.length) f.set("keywords", list.slice(0, -1).join(", "));
        }
      },
      dropKeyword: (k) => () => f.set("keywords", String(f.get("keywords", "")).split(",").map((x) => x.trim()).filter((x) => x && x !== k).join(", ")),
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h505:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h506:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h507:hover{background:#e9eef5 !important;color:#1e293b !important}
.dc-h508:hover{background:#e9eef5 !important;color:#1e293b !important}
`;

// ---- markup ----

export default class SetSeoScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetSeo">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div className={"set-shell" + (this.props.embedded ? " set-shell--embedded" : "")}>
          <div data-dc-import="SetChrome" className="set-shell__rail"><__SetChrome embedded /></div>
          <div className="set-shell__main">
            <div data-dc-import="SetTopbar" className="set-shell__top"><__SetTopbar embedded crumb="SEO" /></div>
            <div className="set-shell__body">
              <div data-dc-import="SetRail" className="set-shell__nav"><__SetRail embedded active="seo" /></div>
              <form className="set-shell__col" noValidate onSubmit={v.f.submit}>
                <div className="set-content">
                  <main className="set-main">
                    <header className="set-pagehead">
                      <span className="set-pagehead__text">
                        <h1 className="ix-head__title">SEO</h1>
                        <__SetTips />
                        <span className="gc-pagehead__about" hidden>Previews are rendered from the fields on the left, not from the live site.</span>
                      </span>
                      <span style={{ marginLeft: "auto", flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "#f1f5f9", color: "var(--text-muted)" }}>Indexed · 1,284 pages</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last saved 2 Sep 2026, 10:12 AM</span>
                      </span>
                    </header>
                    <section id="s0" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Search appearance</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Indexed</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Crawled 6 Sep</span>
                        </span>
                      </div>
                      <div className="set-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "20px", padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("seo_title")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>SEO title <span className="set-req" aria-hidden="true">*</span></label>
                            </span>
                            <span id={v.f.id("seo_title") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Around 60 characters. Put the store name last — the first words carry the most weight.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                              <__In f={v.f} n="seo_title" labelled desc />
                            </span>
                            <__Err f={v.f} n="seo_title" />
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: v.meter("seo_title", 60).pct, height: "100%", background: v.meter("seo_title", 60).color }} />
                              </span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{v.meter("seo_title", 60).len} / 60 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("meta_description")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Meta description</label>
                            </span>
                            <span id={v.f.id("meta_description") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>One or two sentences. Search engines may rewrite it, but a good one still lifts click-through.</span>
                            <div className="set-box" style={{ border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "9px 11px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#1e293b" }}><__In f={v.f} n="meta_description" labelled desc rows={2} /></div>
                            <__Err f={v.f} n="meta_description" />
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: v.meter("meta_description", 160).pct, height: "100%", background: v.meter("meta_description", 160).color }} />
                              </span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-warning)", fontVariantNumeric: "tabular-nums" }}>{v.meter("meta_description", 160).len} / 160 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("keywords")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Keywords</label>
                            </span>
                            <span id={v.f.id("keywords") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Low value for ranking; still used by your own site search synonyms. Press Enter or a comma to add one.</span>
                            <span className="set-box" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", minHeight: "44px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "6px 8px", fontSize: "var(--text-xs)", color: "#334155" }}>
                              {v.keywords.map((k) => (
                                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "2px", height: "28px", borderRadius: "var(--radius-md)", background: "#f1f5f9", padding: "0 2px 0 8px" }}>{k}
                                  <button type="button" aria-label={"Remove keyword " + k} onClick={v.dropKeyword(k)} style={{ display: "grid", placeItems: "center", width: "24px", height: "24px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0", color: "var(--text-muted)", cursor: "pointer" }}><__Icon name="x" strokeWidth="1.75" width="12" height="12" aria-hidden="true" /></button>
                                </span>
                              ))}
                              <input id={v.f.id("keywords")} className="set-in" style={{ flex: "1 1 120px", width: "auto", height: "28px" }} value={v.draft} onChange={v.setDraft} onKeyDown={v.keywordKey} onBlur={v.addKeyword} placeholder="Add keyword…" aria-describedby={v.f.id("keywords") + "-help"} autoComplete="off" />
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("author_name")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Author name</label>
                            </span>
                            <span id={v.f.id("author_name") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Written into the article schema on blog and campaign pages.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", width: "260px", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                              <__In f={v.f} n="author_name" labelled desc />
                            </span>
                            <__Err f={v.f} n="author_name" />
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", minWidth: "0" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Search result preview</span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "14px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "7px", paddingBottom: "6px" }}>
                              <span style={{ display: "grid", placeItems: "center", width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "#003087", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#fff" }}>S</span>
                              <span style={{ display: "block" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#334155" }}>GridShop</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "15px", color: "var(--text-muted)" }}>gridshop.com.bd</span>
                              </span>
                            </span>
                            <span style={{ display: "block", fontSize: "var(--text-sm-plus)", lineHeight: "20px", color: "#1a3fa8", paddingBottom: "3px" }}>{v.clip("seo_title", 60)}</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}>{v.clip("meta_description", 160)}</span>
                          </div>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Titles longer than 60 characters are cut off on mobile. {v.meter("seo_title", 60).len <= 60 ? "Yours fits with " + (60 - v.meter("seo_title", 60).len) + " characters spare." : "Yours is " + (v.meter("seo_title", 60).len - 60) + " characters too long."}</span>
                          {v.meter("meta_description", 160).len > 150 ? (<span style={{ display: "flex", alignItems: "center", gap: "7px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.1)", padding: "9px 11px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "#7a4a00" }}><__Icon name="triangle-alert" strokeWidth="1.75" width="14" height="14" style={{ flex: "none", color: "var(--text-warning)" }} />{"The description is " + v.meter("meta_description", 160).len + " of 160 characters" + (v.meter("meta_description", 160).len > 160 ? ". Search engines will cut it short." : ". It is close to being cut short.")}</span>) : null}
                        </div>
                      </div>
                    </section>
                    <section id="s1" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">Social card</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <button type="button" onClick={v.f.say("Facebook was asked to fetch the card again. It can take a few minutes to show.", "success")} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "var(--control-height)", borderRadius: "var(--radius-lg)", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", border: "none", background: "#f1f5f9", color: "#1e293b" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="15" height="15" />Refresh Facebook cache</button>
                        </span>
                      </div>
                      <div className="set-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "20px", padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("og_title")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OG title</label>
                            </span>
                            <span id={v.f.id("og_title") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Shorter than the SEO title — social cards clip around 40 characters.</span>
                            <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontSize: "var(--text-sm)", color: "#1e293b" }}>
                              <__In f={v.f} n="og_title" labelled desc />
                            </span>
                            <__Err f={v.f} n="og_title" />
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: v.meter("og_title", 40).pct, height: "100%", background: v.meter("og_title", 40).color }} />
                              </span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{v.meter("og_title", 40).len} / 40 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor={v.f.id("og_description")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OG description</label>
                            </span>
                            <span id={v.f.id("og_description") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>One line. Written for a person scrolling, not for a crawler.</span>
                            <div className="set-box" style={{ border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "9px 11px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#1e293b" }}><__In f={v.f} n="og_description" labelled desc rows={2} /></div>
                            <__Err f={v.f} n="og_description" />
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "2px" }}>
                              <span style={{ flex: "1", maxWidth: "200px", height: "4px", borderRadius: "var(--radius-full)", background: "#f1f5f9", overflow: "hidden" }}>
                                <span style={{ display: "block", width: v.meter("og_description", 110).pct, height: "100%", background: v.meter("og_description", 110).color }} />
                              </span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{v.meter("og_description", 110).len} / 110 characters</span>
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>OG image</span>
                            </span>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Same media tile as Brand assets. 1200×630 keeps text readable in every app.</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px" }}>
                              <span style={{ display: "grid", placeItems: "center", width: "96px", height: "50px", flex: "none", borderRadius: "var(--radius-md)", background: "repeating-linear-gradient(135deg,#f8fafc 0 6px,#f1f5f9 6px 12px)", color: "var(--text-muted)" }}>
                                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)" }}>og-card.png</span>
                              </span>
                              <span style={{ display: "block", flex: "1", minWidth: "0" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>og-card-september.png</span>
                                <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>PNG · 1200×630 · 214KB</span>
                              </span>
                              <span style={{ display: "flex", gap: "6px" }}>
                                <button type="button" onClick={v.f.say("“Replace” is not available in the demo yet.")} className="dc-h505" aria-label="Replace" title="Replace" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="replace" strokeWidth="1.75" width="15" height="15" />
                                </button>
                                <button type="button" onClick={v.f.say("“Remove” is not available in the demo yet.")} className="dc-h506" aria-label="Remove" title="Remove" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                                  <__Icon name="trash-2" strokeWidth="1.75" width="15" height="15" />
                                </button>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", minWidth: "0" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Shared link preview</span>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                            <span style={{ display: "grid", placeItems: "center", height: "158px", background: "repeating-linear-gradient(135deg,#f8fafc 0 8px,#f1f5f9 8px 16px)", color: "var(--text-muted)" }}>
                              <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs)" }}>og image · 1200×630</span>
                            </span>
                            <span style={{ display: "block", borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "10px 12px" }}>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>gridshop.com.bd</span>
                              <span style={{ display: "block", paddingTop: "2px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.clip("og_title", 40)}</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.clip("og_description", 110)}</span>
                            </span>
                          </div>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Messenger and WhatsApp cache this card for up to 7 days. Refresh after changing the image.</span>
                        </div>
                      </div>
                    </section>
                    <section id="s2" className="ix-card set-card">
                      <div className="set-head">
                        <span style={{ display: "block" }}>
                          <h2 className="set-title">{"Analytics & pixels"}</h2>
                        </span>
                        <span style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "20px", borderRadius: "var(--radius-full)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".02em", background: "rgba(16,185,129,.14)", color: "var(--text-success)" }}>Both verified</span>
                        </span>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("google_analytics_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Google Analytics ID</label>
                          </span>
                          <span id={v.f.id("google_analytics_id") + "-help"} className="set-help" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Analytics → Admin → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Data streams</b> → your web stream. Starts with G-.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)" }}>
                            <__In f={v.f} n="google_analytics_id" labelled desc />
                            <button type="button" onClick={v.f.copy("google_analytics_id")} className="dc-h507" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="google_analytics_id" />
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Receiving events · last hit 3 minutes ago</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <label htmlFor={v.f.id("facebook_pixel_id")} style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Facebook Pixel ID</label>
                          </span>
                          <span id={v.f.id("facebook_pixel_id") + "-help"} className="set-help set-help--keep" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", maxWidth: "560px" }}>Events Manager → <b style={{ fontWeight: "var(--weight-medium)", color: "#475569" }}>Data sources</b> → your pixel. Numeric, 15–16 digits.</span>
                          <span className="set-box" style={{ display: "flex", alignItems: "center", gap: "8px", height: "var(--control-height)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 4px 0 11px", fontSize: "var(--text-sm)", color: "#1e293b", fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", fontVariantNumeric: "tabular-nums" }}>
                            <__In f={v.f} n="facebook_pixel_id" labelled desc />
                            <button type="button" onClick={v.f.copy("facebook_pixel_id")} className="dc-h508" aria-label="Copy" title="Copy" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-md)", background: "#f1f5f9", color: "#475569", cursor: "pointer" }}>
                              <__Icon name="copy" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                          <__Err f={v.f} n="facebook_pixel_id" />
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-success)" }}><__Icon name="circle-check" strokeWidth="1.75" width="13" height="13" />Purchase and AddToCart firing</span>
                        </div>
                      </div>
                    </section>
                  </main>
                </div>
                <__SaveBar f={v.f} note="· 2 Sep 2026, 10:12 AM" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
