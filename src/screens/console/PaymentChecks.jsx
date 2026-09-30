'use client';
// Generated from design/templates/console/PaymentChecks.dc.html by scripts/convert-design.mjs.
// Removed screen
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() {
    return {};
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:6px;background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

`;

// ---- markup ----

export default class PaymentChecksScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="PaymentChecks">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "600px", display: "flex", alignItems: "center", justifyContent: "center", background: "#e9eef5" }}>
          <div className="card" style={{ maxWidth: "640px", padding: "36px 40px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span className="pill p-grey" style={{ alignSelf: "flex-start" }}>Removed</span>
            <h1 style={{ margin: "0", fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>Payment checks is no longer a screen</h1>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#475569" }}>There is no auto-renewal and no screenshot queue. Merchants pay from their own panel, or staff call and record the payment. Both happen in Collections and on each merchant's page.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <__Link href="/collections" className="btn solid">Open Collections</__Link>
              <__Link href="/merchant-detail" className="btn ghost">Open a merchant page</__Link>
            </div>
            <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>This board can be deleted from the canvas.</p>
          </div>
        </div>
      </div>
    );
  }
}
