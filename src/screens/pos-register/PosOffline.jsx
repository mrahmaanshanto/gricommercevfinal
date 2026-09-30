'use client';
// Generated from design/templates/pos-register/PosOffline.dc.html by scripts/convert-design.mjs.
// PosOffline
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __PosActive from '@/screens/pos-register/PosActive';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `input,select{box-sizing:border-box}
html,body{height:100%}
.dc-h357:hover{background:#f8fafc !important}
.dc-h358:hover{background:#002a77 !important}
.dc-h359:hover{background:#e2e8f0 !important}
.dc-h360:hover{background:#002a77 !important}
.dc-h361:hover{background:#002a77 !important}
.dc-h362:hover{background:rgba(203,213,225,.25) !important;color:#1e293b !important}`;

// ---- markup ----

export default class PosOfflineScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="PosOffline">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {!this.props.embedded && <__PosFit />}
        {!this.props.embedded && <__PosSwitcher />}
        <div data-pos-fit="1380x880" style={{ position: "relative", width: "100%", minWidth: "1380px", height: "100vh", minHeight: "880px", maxHeight: "100%", overflow: "hidden", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif" }}>
          <div data-dc-import="PosActive" style={{ width: "100%", height: "100%" }}><__PosActive embedded /></div>
          <div style={{ position: "absolute", left: "294px", top: "27px", height: "32px", display: "flex", alignItems: "center", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", height: "30px", borderRadius: "9999px", background: "rgba(255,87,36,.12)", padding: "0 4px", whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#c2380f" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#ff5724" }} /><__Icon name="cloud-off" strokeWidth="1.75" width="14" height="14" />Offline</span>
              <span style={{ width: "1px", height: "14px", background: "rgba(255,87,36,.35)" }} />
              <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#c2380f" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#ff5724" }} /><__Icon name="printer" strokeWidth="1.75" width="14" height="14" />Printer</span>
              <span style={{ width: "1px", height: "14px", background: "rgba(255,87,36,.35)" }} />
              <span style={{ display: "inline-flex", height: "30px", alignItems: "center", gap: "6px", padding: "0 8px", fontSize: "12px", fontWeight: "500", color: "#c2380f" }}><span style={{ width: "7px", height: "7px", flex: "none", borderRadius: "9999px", background: "#ff5724" }} /><__Icon name="inbox" strokeWidth="1.75" width="14" height="14" />Drawer open</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: "92px", right: "calc(clamp(380px,36%,520px) + 36px)", top: "126px", background: "#f8fafc", padding: "6px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px", borderRadius: "8px", background: "rgba(255,152,0,.14)", border: "1px solid rgba(255,152,0,.4)", boxShadow: "0 10px 30px -14px rgba(15,23,42,.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "#fff", color: "#b36a00" }}>
                  <__Icon name="cloud-off" strokeWidth="1.75" width="19" height="19" />
                </span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: "14px", fontWeight: "600", letterSpacing: ".025em", color: "#6b3f00", whiteSpace: "nowrap" }}>Working offline — selling continues</span>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#8a5200" }}>Since 3:26 PM · 18 min</span>
                </span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", flex: "none" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: "2px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase", color: "#8a5200" }}>Queued to sync</span>
                    <span style={{ fontSize: "17px", fontWeight: "700", color: "#6b3f00", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>7 sales · ৳24,180.00</span>
                  </span>
                  <button className="dc-h357" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="list" strokeWidth="1.75" width="16" height="16" />View queue</button>
                  <button className="dc-h358" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 13px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="16" height="16" />Retry now</button>
                </span>
              </div>
              <span style={{ display: "block", fontSize: "12px", lineHeight: "18px", color: "#7a4c05", textWrap: "pretty" }}><span style={{ fontWeight: "600" }}>Still works:</span> scanning, basket, cash and card tenders, receipt printing, held sales. <span style={{ fontWeight: "600" }}>Paused:</span> live stock counts, loyalty lookups, bKash / Nagad / Rocket confirmations, customer search beyond this counter’s cache.</span>
            </div>
          </div>
          <div style={{ position: "absolute", right: "20px", bottom: "196px", width: "352px", borderRadius: "8px", background: "#fff", boxShadow: "0 16px 40px -12px rgba(15,23,42,.4)", borderLeft: "4px solid #ff5724", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 12px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ width: "8px", height: "8px", flex: "none", borderRadius: "9999px", background: "#ff5724" }} />
              <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Printer disconnected</span>
            </div>
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "9px" }}>
              <span style={{ display: "block", fontSize: "12px", lineHeight: "17px", color: "#475569" }}>EPSON TM-T82 · USB · last seen 3:31 PM. Receipts for the last 3 sales are queued and will print in order once it reconnects.</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Queued receipts</span>
                  <span style={{ fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Cash drawer link</span>
                  <span style={{ fontWeight: "500", color: "#c2380f" }}>Through printer — offline</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="dc-h359" style={{ flex: "1", height: "38px", border: "none", borderRadius: "8px", background: "#e9eef5", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>Print later</button>
                <button className="dc-h360" style={{ flex: "1", height: "38px", border: "none", borderRadius: "8px", background: "#003087", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>Reconnect</button>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", right: "20px", bottom: "20px", width: "352px", borderRadius: "8px", background: "#fff", boxShadow: "0 16px 40px -12px rgba(15,23,42,.45)", borderLeft: "4px solid #ff5724", overflow: "hidden" }}>
            <div style={{ padding: "13px 14px", display: "flex", gap: "11px" }}>
              <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "rgba(255,87,36,.12)", color: "#c2380f" }}>
                <__Icon name="inbox" strokeWidth="1.75" width="19" height="19" />
              </span>
              <span style={{ display: "block", minWidth: "0" }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Cash drawer is open</span>
                {" "}
                <span style={{ display: "block", fontSize: "12px", lineHeight: "17px", color: "#475569" }}>Open for 2 min 14 sec at Counter 2. Close it to take the next sale — the register will not accept cash tenders while the drawer is out.</span>
                {" "}
                <span style={{ display: "flex", gap: "6px", paddingTop: "9px" }}>
                  <button className="dc-h361" style={{ height: "34px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>I closed it</button>
                  <button className="dc-h362" style={{ height: "34px", border: "none", borderRadius: "8px", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#64748b", cursor: "pointer" }}>Snooze 5 min</button>
                </span>
              </span>
            </div>
          </div>
          <div style={{ position: "absolute", left: "92px", bottom: "20px", width: "404px", borderRadius: "8px", background: "#fff", boxShadow: "0 16px 40px -12px rgba(15,23,42,.35)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 13px", borderBottom: "1px solid #e2e8f0" }}>
              <__Icon name="database-backup" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />
              <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>Offline queue</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>Syncs oldest first</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 13px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ width: "132px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#003087" }}>ORD-20260907-0038</span>
                <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#64748b" }}>Cash · 3 items</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳4,120.00</span>
                <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "11px", fontWeight: "500", color: "#b36a00" }}>Queued</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 13px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ width: "132px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#003087" }}>ORD-20260907-0039</span>
                <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#64748b" }}>Card · 7 items</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳9,340.00</span>
                <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "11px", fontWeight: "500", color: "#b36a00" }}>Queued</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 13px" }}>
                <span style={{ width: "132px", flex: "none", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", color: "#003087" }}>ORD-20260907-0040</span>
                <span style={{ flex: "1", minWidth: "0", fontSize: "12px", color: "#64748b" }}>bKash · needs confirmation</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,720.60</span>
                <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,87,36,.14)", padding: "0 8px", fontSize: "11px", fontWeight: "500", color: "#c2380f" }}>Blocked</span>
              </div>
            </div>
            <div style={{ padding: "10px 13px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>4 more queued</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>Total ৳24,180.00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
