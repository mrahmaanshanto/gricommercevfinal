'use client';
// Generated from design/templates/purchase-stock/MobileReceive.dc.html by scripts/convert-design.mjs.
// Receive goods · phone
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var RC = [
  { name: 'Men’s Polo Shirt · Navy · M', pending: 20 },
  { name: 'Men’s Polo Shirt · Navy · L', pending: 20 },
  { name: 'Denim Jeans · Blue · 32', pending: 10 },
  { name: 'Denim Jeans · Blue · 34', pending: 10 },
  { name: 'Cotton T-shirt · Black · M', pending: 40 }
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var got = s.got || [20, 12, 6, 4, 1];
    var n = s.n || 0;
    var last = s.last != null ? s.last : 4;
    var total = got.reduce(function (a, b) { return a + b; }, 0);
    var pend = RC.reduce(function (a, r) { return a + r.pending; }, 0);
    var lines = RC.map(function (r, i) {
      var g = got[i], full = g >= r.pending;
      return { name: r.name, got: g, pending: r.pending, sub: full ? 'All here' : (r.pending - g) + ' still to scan', subColor: full ? '#047857' : '#64748b', cls: s.flash === i ? 'flash' : '' };
    });
    var bad = !!s.bad;
    return {
      lines: lines, got: total, pending: pend,
      hasMsg: true, msgBg: bad ? '#ffece6' : '#e7f8f1', msgFg: bad ? '#8a2a0c' : '#065f46',
      msgTitle: bad ? 'Not on this order' : 'Beep — +1 added',
      msgSub: bad ? 'Put this item aside and tell the manager.' : RC[last].name,
      scan: function () {
        clearTimeout(self.t);
        if (n % 5 === 4) { self.setState({ n: n + 1, bad: true, flash: null }); }
        else { var order = [4, 1, 2, 3, 4]; var i = order[n % order.length]; var g = got.slice(); g[i]++; self.setState({ got: g, n: n + 1, last: i, bad: false, flash: i }); }
        self.t = setTimeout(function () { self.setState({ flash: null }); }, 900);
      }
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class MobileReceiveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MobileReceive">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "390px", height: "844px", background: "#f8fafc", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <header style={{ flexShrink: "0", display: "flex", alignItems: "center", gap: "8px", padding: "12px 12px 12px 8px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
            <__Link href="/receive-goods" className="ib" aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <div style={{ flexGrow: "1", minWidth: "0" }}>
              <div style={{ fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Receive goods</div>
              <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>PO-2609-0020 · Nabil Fashion House</div>
            </div>
            <button type="button" className="ib" aria-label="Scan from a photo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
          </header>
          <button type="button" onClick={v.scan} aria-label="Scan a barcode" style={{ position: "relative", flexShrink: "0", height: "250px", margin: "0", border: "0", padding: "0", background: "#0b1220", cursor: "pointer", overflow: "hidden", font: "inherit" }}>
            <span style={{ position: "absolute", left: "55px", top: "40px", width: "280px", height: "170px", borderRadius: "var(--radius-xl)", border: "2px solid rgba(255,255,255,.85)" }} />
            {" "}
            <span className="scanline" style={{ position: "absolute", left: "70px", top: "50px", width: "250px", height: "2px", background: "#009cde", boxShadow: "0 0 12px 2px rgba(0,156,222,.8)" }} />
            {" "}
            <span style={{ position: "absolute", left: "0", right: "0", bottom: "14px", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "rgba(255,255,255,.85)" }}>Point the camera at a barcode · tap to try</span>
          </button>
          <div style={{ flexShrink: "0", padding: "14px 16px 0" }}>
            {v.hasMsg ? (<>
              <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-xl); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""};`)}>
                <span style={{ flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <path d="M8 7v10" />
                    <path d="M12 7v10" />
                    <path d="M17 7v10" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)" }}>{v.msgTitle}</div>
                  <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px" }}>{v.msgSub}</div>
                </div>
              </div>
            </>) : null}
          </div>
          <div style={{ flexShrink: "0", display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 16px 8px" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>This delivery</span>
            <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><strong style={{ fontSize: "var(--text-lg)", color: "#0f172a" }}>{v.got}</strong> of {v.pending} pieces</span>
          </div>
          <div style={{ flexGrow: "1", overflow: "hidden", padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {__list(v.lines).map((l, $index) => (<React.Fragment key={$index}>
                <div className={l?.cls} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{l?.name}</div>
                    <div style={__sx(`font-size: var(--text-xs); line-height: 16px; color: ${l?.subColor ?? ""};`)}>{l?.sub}</div>
                  </div>
                  <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", minWidth: "64px", textAlign: "right" }}>{l?.got}<span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>/{l?.pending}</span></div>
                </div>
              </React.Fragment>))}
          </div>
          <div style={{ flexShrink: "0", padding: "12px 16px 20px", background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
            <button type="button" className="btn solid big" style={{ width: "100%", height: "52px", fontSize: "var(--text-base)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>Save delivery</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
