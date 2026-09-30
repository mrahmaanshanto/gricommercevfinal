'use client';
// Generated from design/templates/pos-register/PosRegister.dc.html by scripts/convert-design.mjs.
// PosRegister — Counter-ready point of sale: context bar, product grid, pinned sale panel, split tender, keypad, held sales, returns, register open/close and offline states.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __PosActive from '@/screens/pos-register/PosActive';
import __PosClose from '@/screens/pos-register/PosClose';
import __PosIdle from '@/screens/pos-register/PosIdle';
import __PosKeypad from '@/screens/pos-register/PosKeypad';
import __PosOffline from '@/screens/pos-register/PosOffline';
import __PosOpen from '@/screens/pos-register/PosOpen';
import __PosPay from '@/screens/pos-register/PosPay';
import __PosReturn from '@/screens/pos-register/PosReturn';
import __PosSales from '@/screens/pos-register/PosSales';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2000); setTimeout(go, 4000);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `html,body{height:100%}
*{box-sizing:border-box}body{margin:0;background:#e6eaf1;font-family:var(--font-sans);color:#475569;-webkit-font-smoothing:antialiased}a{color:#003087;text-decoration:none}a:hover{color:#002a77}@keyframes scanring{0%,100%{box-shadow:0 0 0 3px rgba(0,48,135,.5)}50%{box-shadow:0 0 0 5px rgba(0,48,135,.28)}}@keyframes scanringdark{0%,100%{box-shadow:0 0 0 3px rgba(0,156,222,.5)}50%{box-shadow:0 0 0 5px rgba(0,156,222,.28)}}`;

// ---- markup ----

export default class PosRegisterScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosRegister">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosSwitcher />}
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "52px", width: "max-content" }}>
          <header style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "900px" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--accent-text)" }}>Point of sale · rebuild</span>
            <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>POS register</h1>
            <p style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", color: "#475569", textWrap: "pretty" }}>Twelve artboards for the counter screen: a thin context bar, a product panel, and a sale panel that is pinned so totals and actions never leave the viewport. Desktop frames are 1440 × 900, the tablet frame is 1024 × 768. Amounts are BDT, the interface is bilingual, and every price uses lining numerals.</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "6px" }}>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}>One accent: navy #003087</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}>Red / amber / green are semantic only</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>8px grid · 8–12px radii</span>
              <span style={{ display: "inline-flex", height: "24px", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>Touch targets ≥ 44px</span>
            </div>
          </header>
          <section data-screen-label="01 POS idle" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>01</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>POS — idle / empty sale</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Desktop 1440 × 900 · Light · scanner ready</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosIdle" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosIdle embedded /></div>
            </div>
          </section>
          <section data-screen-label="02 POS active sale" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>02</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>POS — active sale</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Desktop 1440 × 900 · Light · 6 lines, promotion applied, list scrolled</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosActive" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosActive embedded /></div>
            </div>
          </section>
          <section data-screen-label="03 Take payment" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>03</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Take payment — split tender</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Modal over the sale · cash + bKash, change due, remaining balance</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosPay" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosPay embedded /></div>
            </div>
          </section>
          <section data-screen-label="04 Numeric keypad" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>04</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Numeric keypad</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Line-item quantity / price edit · docked panel and modal over a line</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosKeypad" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosKeypad embedded /></div>
            </div>
          </section>
          <section data-screen-label="05 Held and recent sales" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>05</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Held sales & recent sales"}</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Right drawer, two tabs · resume, discard, reprint, open details</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosSales" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosSales embedded /></div>
            </div>
          </section>
          <section data-screen-label="06 Exchange or return" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>06</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Exchange / return</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Prior-sale lookup, line selection, settlement of the difference</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosReturn" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosReturn embedded /></div>
            </div>
          </section>
          <section data-screen-label="07 Register opening" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>07</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Register opening checklist</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Guided steps · cashier, counter, opening float, denomination breakdown</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosOpen" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosOpen embedded /></div>
            </div>
          </section>
          <section data-screen-label="08 Register closing" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>08</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Open / close shift</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Count the drawer by note, match cash, bKash, Nagad and card, then close and print</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosClose" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosClose embedded /></div>
            </div>
          </section>
          <section data-screen-label="09 Offline and hardware" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>09</span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Offline & hardware states"}</h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Offline banner with queued sales, printer disconnected, cash drawer open</span>
            </div>
            <div style={{ width: "1440px", height: "900px", flex: "none", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#f8fafc", boxShadow: "0 10px 34px -10px rgba(15,23,42,.22)" }}>
              <div data-dc-import="PosOffline" style={{ flex: "1", minWidth: "0", height: "100%" }}><__PosOffline embedded /></div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
