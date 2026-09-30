'use client';
// Generated from design/templates/settings-console/SetRail.dc.html by scripts/convert-design.mjs.
// SetRail
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  constructor(p) { super(p); this.scroller = React.createRef(); }
  componentDidMount() { this.paint(); this.reveal(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 300); setTimeout(go, 900); setTimeout(go, 2500);
  }
  reveal() {
    const run = () => {
      const box = this.scroller.current; if (!box) return;
      const row = box.querySelector('[data-row="' + (this.props.active || 'general') + '"]');
      if (row) box.scrollTop = Math.max(0, row.offsetTop - 150);
    };
    setTimeout(run, 120); setTimeout(run, 600);
  }
  renderVals() {
    const active = this.props.active || 'general';
    const raw = [
      ['Store', [['general', 'General', 'ok'], ['preference', 'Preference', 'ok'], ['pos', 'POS', 'ok'], ['report', 'Report Settings', 'none']]],
      ['Commerce', [['payment', 'Payment Gateway', 'ok'], ['delivery', 'Delivery Settings', 'ok'], ['courier', 'Courier Settings', 'warn', '1']]],
      ['Communication', [['mail', 'Mail', 'ok'], ['sms', 'SMS', 'warn', '1'], ['push', 'Push Notifications', 'off'], ['social', 'Social Integrations', 'ok'], ['ai', 'AI Auto-Reply', 'ok'], ['rules', 'Auto-Reply Rules', 'ok'], ['usage', 'AI Usage', 'none']]],
      ['Discovery', [['seo', 'SEO', 'ok'], ['smart', 'Smart Search', 'ok'], ['imgsearch', 'Image Search', 'off']]],
      ['Platform', [['storage', 'Storage', 'warn', '1'], ['realtime', 'Realtime (Websocket)', 'ok'], ['apisec', 'API Security', 'ok'], ['recaptcha', 'Recaptcha', 'off'], ['dbbackup', 'Database Backup', 'ok'], ['filebackup', 'File Backup', 'warn', '1']]]
    ];
    return {
      scroller: this.scroller,
      groups: raw.map(([label, items]) => ({
        label, count: items.length,
        items: items.map(([id, name, dot, badge]) => ({
          id, name, badge: badge || false,
          ok: dot === 'ok', warn: dot === 'warn', quiet: dot === 'off', none: dot === 'none',
          active: id === active, inactive: id !== active
        }))
      }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h461:hover{background:rgba(0,48,135,.06) !important}
.dc-h462:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h463:hover{border-color:#94a3b8 !important}
.dc-h464:hover{color:#475569 !important}
.dc-h465:hover{background:#f1f5f9 !important;color:#1e293b !important}`;

// ---- markup ----

export default class SetRailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetRail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <nav aria-label="Settings sections" style={{ width: "272px", flex: "none", height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0", background: "#fff", fontFamily: "Poppins,ui-sans-serif,system-ui,sans-serif" }}>
          <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: "10px", padding: "16px 14px 12px" }}>
            <__Link className="dc-h461" href="/merchant-overview" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 10px", marginLeft: "-6px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "#003087", textDecoration: "none", alignSelf: "flex-start" }}><__Icon name="arrow-left" strokeWidth="1.75" width="15" height="15" />Back to dashboard</__Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: ".015em", color: "#1e293b" }}>Settings</span>
              <button className="dc-h462" aria-label="Collapse settings nav" style={{ marginLeft: "auto", width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "7px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                <__Icon name="panel-left-close" strokeWidth="1.75" width="16" height="16" />
              </button>
            </div>
            <label className="dc-h463" style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", color: "#94a3b8", cursor: "text" }}>
              <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
              <span style={{ flex: "1", fontSize: "13px" }}>Search all settings</span>
              <span style={{ display: "inline-flex", height: "20px", alignItems: "center", borderRadius: "5px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 5px", fontSize: "10.5px", fontWeight: "500", color: "#64748b" }}>⌘/</span>
            </label>
            <span style={{ fontSize: "11.5px", lineHeight: "16px", color: "#64748b" }}>Matches individual fields across all 23 tabs — try “timezone”, “bKash” or “S3”.</span>
          </div>
          <div ref={v.scroller} style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "0 10px 12px" }}>
            {__list(v.groups).map((g, $index) => (<React.Fragment key={$index}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", paddingBottom: "10px" }}>
                  <button className="dc-h464" style={{ display: "flex", alignItems: "center", gap: "5px", height: "28px", border: "none", background: "none", padding: "0 6px", fontFamily: "inherit", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".11em", textTransform: "uppercase", color: "#94a3b8", cursor: "pointer" }}><__Icon name="chevron-down" strokeWidth="1.75" width="13" height="13" />{g?.label}<span style={{ marginLeft: "auto", letterSpacing: ".02em", fontWeight: "500", color: "#cbd5e1" }}>{g?.count}</span></button>
                  {__list(g?.items).map((it, $index) => (<React.Fragment key={$index}>
                      {it?.inactive ? (<>
                        <a className="dc-h465" href="#" data-row={it?.id} style={{ display: "flex", alignItems: "center", gap: "9px", height: "32px", borderRadius: "8px", padding: "0 9px", fontSize: "13px", fontWeight: "400", letterSpacing: ".005em", textDecoration: "none", background: "none", color: "#475569" }}>
                          {it?.ok ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                          </>) : null}
                          {it?.warn ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />
                          </>) : null}
                          {it?.quiet ? (<>
                            <span style={{ flex: "none", boxSizing: "border-box", width: "7px", height: "7px", borderRadius: "9999px", border: "1.5px solid #cbd5e1" }} />
                          </>) : null}
                          {it?.none ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px" }} />
                          </>) : null}
                          <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it?.name}</span>
                          {it?.badge ? (<>
                            <span style={{ flex: "none", display: "inline-flex", height: "18px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.16)", padding: "0 6px", fontSize: "10px", fontWeight: "600", color: "#b36a00" }}>{it?.badge}</span>
                          </>) : null}
                        </a>
                      </>) : null}
                      {it?.active ? (<>
                        <a href="#" data-row={it?.id} style={{ display: "flex", alignItems: "center", gap: "9px", height: "32px", borderRadius: "8px", padding: "0 9px", fontSize: "13px", fontWeight: "600", letterSpacing: ".005em", textDecoration: "none", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                          {it?.ok ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />
                          </>) : null}
                          {it?.warn ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />
                          </>) : null}
                          {it?.quiet ? (<>
                            <span style={{ flex: "none", boxSizing: "border-box", width: "7px", height: "7px", borderRadius: "9999px", border: "1.5px solid #cbd5e1" }} />
                          </>) : null}
                          {it?.none ? (<>
                            <span style={{ flex: "none", width: "7px", height: "7px" }} />
                          </>) : null}
                          <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it?.name}</span>
                          {it?.badge ? (<>
                            <span style={{ flex: "none", display: "inline-flex", height: "18px", alignItems: "center", borderRadius: "9999px", background: "rgba(255,152,0,.16)", padding: "0 6px", fontSize: "10px", fontWeight: "600", color: "#b36a00" }}>{it?.badge}</span>
                          </>) : null}
                        </a>
                      </>) : null}
                    </React.Fragment>))}
                </div>
              </React.Fragment>))}
          </div>
          <div style={{ flex: "none", display: "flex", flexWrap: "wrap", gap: "4px 12px", borderTop: "1px solid #e2e8f0", padding: "10px 14px", fontSize: "11px", color: "#64748b" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#10b981" }} />Configured</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "#ff9800" }} />Needs setup</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", border: "1.5px solid #cbd5e1" }} />Turned off</span>
          </div>
        </nav>
      </div>
    );
  }
}
