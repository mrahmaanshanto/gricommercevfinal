'use client';
// Generated from design/templates/settings-console/SettingsConsole.dc.html by scripts/convert-design.mjs.
// SettingsConsole — Settings console: grouped searchable nav for 23 tabs, sticky save bar, explained fields with live previews, credential cards, media manager, matrix tables and AI usage reporting.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __SetAi from '@/screens/settings-console/SetAi';
import __SetDelivery from '@/screens/settings-console/SetDelivery';
import __SetGeneral from '@/screens/settings-console/SetGeneral';
import __SetMedia from '@/screens/settings-console/SetMedia';
import __SetPayments from '@/screens/settings-console/SetPayments';
import __SetPreference from '@/screens/settings-console/SetPreference';
import __SetRules from '@/screens/settings-console/SetRules';
import __SetSecurity from '@/screens/settings-console/SetSecurity';
import __SetSeo from '@/screens/settings-console/SetSeo';
import __SetStorage from '@/screens/settings-console/SetStorage';
import __SetUsage from '@/screens/settings-console/SetUsage';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2000); setTimeout(go, 4000);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* each frame is its own scrolling window onto one settings page */
.sc-frame{position:relative}
*{box-sizing:border-box}body{margin:0;background:#e6eaf1;font-family:var(--font-sans);color:#475569;-webkit-font-smoothing:antialiased}a{color:#003087;text-decoration:none}a:hover{color:#002a77}`;

// ---- markup ----

export default class SettingsConsoleScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SettingsConsole">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__SettingsSwitcher />}
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "52px", width: "max-content" }}>
          <header style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "900px" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Settings · rebuild</span>
            <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Settings console</h1>
            <p style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", color: "#475569", textWrap: "pretty" }}>Seventeen artboards for the configuration surface: 23 tabs grouped into five categories behind a search that matches individual fields, a save bar pinned to the bottom of the content area, and a field pattern where every setting explains itself and shows what it produces. Desktop frames are 1380 × 880, the tablet frame is 1024 × 768. Currency is BDT, timezone Asia/Dhaka, interface bilingual.</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "6px" }}>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>One accent: navy #003087 · sky in dark</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>Green / amber / red are semantic only</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>8px grid · 8–12px radii</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>Secrets write-only · no hover-only help</span>
            </div>
          </header>
          <section data-screen-label="01 General light" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>01</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Settings shell — General, light</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Grouped searchable nav · section index · explained fields · save bar idle</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetGeneral" style={{ flex: "1", minWidth: "0" }}><__SetGeneral embedded /></div>
            </div>
          </section>
          <section data-screen-label="02 Media manager" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>02</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>General — media manager</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Eight uniform tiles · dark preview engaged · one uploading, one empty, one rejected</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetMedia" style={{ flex: "1", minWidth: "0" }}><__SetMedia embedded /></div>
            </div>
          </section>
          <section data-screen-label="03 Preference" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>03</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Preference — toggle-row system</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Twenty switches grouped under section headers · OTP numerics · saved confirmation</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetPreference" style={{ flex: "1", minWidth: "0" }}><__SetPreference embedded /></div>
            </div>
          </section>
          <section data-screen-label="04 Payment gateway" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>04</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Payment Gateway — overview + expanded card</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Ten routes as a list · bKash expanded with live warning and test connection</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetPayments" style={{ flex: "1", minWidth: "0" }}><__SetPayments embedded /></div>
            </div>
          </section>
          <section data-screen-label="05 Delivery matrix" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>05</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Delivery Settings — zone matrix</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Three zones × five charge columns as one table, with a customer-facing preview</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetDelivery" style={{ flex: "1", minWidth: "0" }}><__SetDelivery embedded /></div>
            </div>
          </section>
          <section data-screen-label="06 AI auto-reply" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>06</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI Auto-Reply</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Model choice with per-million pricing · channel toggles · budget cap with spend bar</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetAi" style={{ flex: "1", minWidth: "0" }}><__SetAi embedded /></div>
            </div>
          </section>
          <section data-screen-label="07 AI usage" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>07</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI Usage — reporting inside settings</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Month selector · spend against budget · daily trend · usage by model</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetUsage" style={{ flex: "1", minWidth: "0" }}><__SetUsage embedded /></div>
            </div>
          </section>
          <section data-screen-label="08 Auto-reply rules" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>08</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Auto-Reply Rules — table + edit panel</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Priority-ordered rules with the edit panel open · empty state on the system sheet</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetRules" style={{ flex: "1", minWidth: "0" }}><__SetRules embedded /></div>
            </div>
          </section>
          <section data-screen-label="09 SEO" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>09</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>SEO — previews and counters</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Search-result and shared-link previews · character counts against real limits</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetSeo" style={{ flex: "1", minWidth: "0" }}><__SetSeo embedded /></div>
            </div>
          </section>
          <section data-screen-label="10 Storage" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>10</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Storage — conditional fields, failed test</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Driver choice drives the form · masked secrets · field error · save-failed bar</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetStorage" style={{ flex: "1", minWidth: "0" }}><__SetStorage embedded /></div>
            </div>
          </section>
          <section data-screen-label="11 API security and backups" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>11</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>API Security + backups</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Type-to-confirm key regeneration · backup history · run backup now</span>
            </div>
            <div className="sc-frame" style={{ width: "1380px", height: "880px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "auto", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)", "--set-vh": "880px" }}>
              <div data-dc-import="SetSecurity" style={{ flex: "1", minWidth: "0" }}><__SetSecurity embedded /></div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
