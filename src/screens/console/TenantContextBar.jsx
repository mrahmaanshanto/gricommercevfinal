'use client';
// Generated from design/templates/console/TenantContextBar.dc.html by scripts/convert-design.mjs.
// Tenant context bar
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const stage = s.stage ?? 'idle';
    const go = (x) => () => this.setState({ stage: x });
    const list = [['idle', 'Store in context'], ['requested', 'Consent requested'], ['viewing', 'Viewing as owner'], ['ended', 'Session ended']];
    const hints = { idle: 'Staff opened the store from the directory.', requested: 'Request sent in the admin and by WhatsApp.', viewing: 'The whole frame is the merchant admin, under the banner.', ended: 'Back in the console, with the record written.' };
    return {
      steps: list.map(([id, label], i) => ({ n: i + 1, label, cls: id === stage ? 'step on' : 'step', pressed: id === stage ? 'true' : 'false', pick: go(id) })),
      hint: hints[stage],
      isIdle: stage === 'idle', isRequested: stage === 'requested', isViewing: stage === 'viewing', isEnded: stage === 'ended',
      request: go('requested'), cancel: go('idle'), approve: go('viewing'), end: go('ended'),
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:var(--font-data);font-size:var(--text-xs);letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:var(--radius-md);background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.step{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;transition:border-color 150ms ease,background-color 150ms ease}
.step:hover{border-color:#94a3b8}
.step.on{border-color:#003087;background:#f2f5f9;color:#003087}
.stepn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--radius-full);background:#e2e8f0;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.step.on .stepn{background:#003087;color:#fff}
.proto{border:1px dashed #0070a0;background:#f2fafd;color:#00567a}.proto:hover{background:#e0f3fb;color:#00567a}
.dark{background:#0f172a;color:#fff}.dark:hover{background:#1e293b;color:#fff}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin 700ms linear infinite}
@media (prefers-reduced-motion: reduce){.spin{animation:none}.step{transition:none}}

`;

// ---- markup ----

export default class TenantContextBarScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="TenantContextBar">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div data-board="" style={{ width: "1440px", height: "2400px", overflow: "hidden", background: "#e9eef5" }}>
          <header style={{ position: "relative", overflow: "hidden", background: "#012169", color: "#fff", padding: "36px 80px 40px" }}>
            <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#7fd4f5" }}>Step 1 · Console foundation</p>
                <nav aria-label="Step 1 boards" style={{ display: "flex", gap: "8px" }}>
                  <__Link href="/core-ui-plan" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>← UI plan</__Link>
                  <__Link href="/console-shell" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Console shell</__Link>
                  <__Link href="/console-shell-dark" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Dark</__Link>
                  <__Link href="/chart-kit" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>Chart and KPI kit</__Link>
                  <__Link href="/tenant-context-bar" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)", background: "rgba(127,212,245,.22)" }} aria-current="page">Tenant context bar</__Link>
                  <__Link href="/system-states" className="btn onnavy" style={{ minHeight: "36px", padding: "0 14px", fontSize: "var(--text-xs-plus)" }}>System states</__Link>
                </nav>
              </div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.1", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>Tenant context bar</h1>
              <p style={{ margin: "0", maxWidth: "820px", fontSize: "var(--text-base)", lineHeight: "1.6", color: "#cbd8ee", textWrap: "pretty" }}>The strip that tells staff which store they are working on, and the consent-and-logged path to seeing that store the way its owner does.</p>
            </div>
          </header>
          <section style={{ padding: "56px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Prototype</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>From context to a logged viewing session</h2>
            <p style={{ margin: "8px 0 0", maxWidth: "780px", fontSize: "var(--text-sm)", lineHeight: "1.65", color: "#475569", textWrap: "pretty" }}>Click through the four stages. The dashed button stands in for the owner's tap on their phone.</p>
            <div className="card" style={{ marginTop: "22px", padding: "24px 28px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", marginBottom: "18px" }}>
                <div role="group" aria-label="Prototype flow" style={{ display: "flex", gap: "10px" }}>
                  {__list(v.steps).map((s, $index) => (<React.Fragment key={$index}>
                      <button className={s?.cls} type="button" onClick={s?.pick} aria-pressed={s?.pressed}><span className="stepn">{s?.n}</span>{s?.label}</button>
                    </React.Fragment>))}
                </div>
                <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.hint}</span>
              </div>
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f4f7fb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", height: "60px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #eef2f7" }}>
                  <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Merchants</span>
                    <span style={{ color: "var(--text-muted)" }}>/</span>
                    <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Dhaka Gadget Hub</span>
                  </nav>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-lg)", background: "#10b981" }} />Production</span>
                </div>
                {v.isIdle ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>DG</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Dhaka Gadget Hub</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0031 · dhakagadgethub.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Retail · Business</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Grace · day 3</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>54 · Watch</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <a className="btn ghost" href="#" aria-label="Open storefront in a new tab" style={{ minHeight: "40px", width: "40px", padding: "0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </a>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Switch store<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m6 9 6 6 6-6" />
</svg></button>
                      <button className="btn solid" type="button" onClick={v.request} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "24px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", borderBottom: "2px solid #003087" }}>Overview</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Health</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Billing</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Usage</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Integrations</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Timeline</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Audit</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "14px", padding: "18px 20px" }}>
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                  </div>
                </>) : null}
                {v.isRequested ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>DG</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Dhaka Gadget Hub</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0031 · dhakagadgethub.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Retail · Business</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Grace · day 3</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>54 · Watch</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: "10px", height: "40px", padding: "0 14px", borderRadius: "var(--radius-lg)", background: "#f2f5f9", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}><svg className="spin" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="9" fill="none" stroke="#bfcbe1" strokeWidth="3" />
  <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" />
</svg>Waiting for the owner · expires in <span className="num" style={{ fontWeight: "var(--weight-medium)" }}>9:41</span></span>
                      <button className="btn ghost" type="button" onClick={v.cancel} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Cancel request</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", padding: "20px" }}>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>What the owner sees, in the admin and on WhatsApp</div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "1.6", color: "#475569", maxWidth: "420px" }}>The request carries the staff name and the reason picked from the ticket. Nothing opens until the owner allows it. Unanswered requests expire after 10 minutes.</div>
                      <button className="btn proto" type="button" onClick={v.approve} style={{ alignSelf: "flex-start", minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Prototype: owner allows</button>
                    </div>
                    <div style={{ width: "380px", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 16px 40px -18px rgba(15,23,42,.35)", border: "1px solid #e6ebf2", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "#012169", color: "#fff" }}>
                        <span style={{ display: "inline-flex" }}>
                          <img src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="" style={{ height: "24px", width: "auto", display: "block" }} />
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>GridCommerce support</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "#a9bddc" }}>now</span>
                      </div>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Farhana from support asks to view your store</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Reason: Steadfast parcels failing since 09:40. She will see your admin as you do, read-only, for up to 30 minutes. Every page she opens is recorded.</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <button className="btn solid" type="button" style={{ flex: "1", minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Allow 30 min</button>
                          <button className="btn ghost" type="button" style={{ flex: "1", minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Decline</button>
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Also sent by WhatsApp to +880 1711-XXXXXX</div>
                      </div>
                    </div>
                  </div>
                </>) : null}
                {v.isViewing ? (<>
                  <div role="status" style={{ display: "flex", alignItems: "center", gap: "14px", minHeight: "60px", padding: "0 20px", background: "#fff4e0", borderTop: "6px solid transparent", borderImage: "repeating-linear-gradient(135deg,#ff9800 0 12px,#ffad33 12px 24px) 1", borderBottom: "1px solid #ffd699" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#ff9800", color: "#1a1204" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Viewing Dhaka Gadget Hub as Farhana Akter · read-only</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#7a3e05" }}>The owner allowed 30 minutes at 14:33. Every page opened here is written to the audit log.</div>
                    </div>
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#7a3e05" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg><span className="num">28:14</span> left</span>
                    <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)", background: "rgba(122,62,5,.08)", color: "#7a3e05" }}>Request edit access</button>
                    <button className="btn dark" type="button" onClick={v.end} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>End session</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", height: "236px", background: "#f4f7fb" }}>
                    <div style={{ background: "#fff", borderRight: "1px solid #e2e8f0", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ height: "12px", width: "70%", borderRadius: "var(--radius-sm)", background: "#bfcbe1" }} />
                      <div style={{ height: "12px", width: "55%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                      <div style={{ height: "12px", width: "62%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                      <div style={{ height: "12px", width: "48%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                      <div style={{ height: "12px", width: "66%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                      <div style={{ height: "12px", width: "52%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                      <div style={{ height: "12px", width: "58%", borderRadius: "var(--radius-sm)", background: "#e2e8f0" }} />
                    </div>
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Dashboard</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Dhaka Gadget Hub admin, exactly as the owner sees it</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                        <div style={{ height: "74px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                        <div style={{ height: "74px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                        <div style={{ height: "74px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                        <div style={{ height: "74px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                      </div>
                      <div style={{ height: "80px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    </div>
                  </div>
                </>) : null}
                {v.isEnded ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>DG</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Dhaka Gadget Hub</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0031 · dhakagadgethub.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Retail · Business</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Grace · day 3</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>54 · Watch</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <a className="btn ghost" href="#" aria-label="Open storefront in a new tab" style={{ minHeight: "40px", width: "40px", padding: "0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </a>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Switch store<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m6 9 6 6 6-6" />
</svg></button>
                      <button className="btn solid" type="button" onClick={v.request} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</button>
                    </div>
                  </div>
                  <div role="status" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "14px 20px 0", padding: "12px 16px", borderRadius: "var(--radius-xl)", background: "#0f172a", color: "#fff", boxShadow: "0 12px 28px -14px rgba(0,0,0,.5)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#10b981", color: "#04121f" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontSize: "var(--text-sm)" }}>Session ended after <span className="num" style={{ fontWeight: "var(--weight-medium)" }}>6 min 12 s</span> · 14 pages viewed, no changes made · written to the audit log</span>
                    <a href="#" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#7fd4f5" }}>View record</a>
                  </div>
                  <div style={{ display: "flex", gap: "24px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", borderBottom: "2px solid #003087" }}>Overview</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Health</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Billing</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Usage</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Integrations</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Timeline</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: "44px", padding: "0 4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", borderBottom: "2px solid transparent" }}>Audit</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "14px", padding: "18px 20px" }}>
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                    <div style={{ height: "84px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #eef2f7" }} />
                  </div>
                </>) : null}
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 0" }}>
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>States</p>
            <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>The bar in every store state</h2>
            <div className="card" style={{ marginTop: "22px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Active and healthy</span>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#0070a0", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>MT</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Mohona Traders</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0012 · mohonatraders.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Wholesale · Enterprise</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <circle cx="10" cy="10" r="7" fill="#10b981" />
</svg>Active</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <circle cx="10" cy="10" r="7" fill="#10b981" />
</svg>Health 90</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>In trial</span>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#2e559d", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>KB</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Kolpo Books</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0061 · kolpobooks.gridcommerce.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Online · Growth · trial</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <circle cx="10" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
</svg>Trial · day 12 of 15</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#b45309", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Health 72 · Watch</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Past due, read-only</span>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#7d94bf", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>BB</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Bindu Beauty</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0044 · bindubeauty.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Online · Business</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#ffece5", color: "#c2410c", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>Past due · read-only</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#ffece5", color: "#c2410c", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>Health 33 · At risk</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Suspended</span>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#64748b", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>RS</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Rupsha Sports</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0038 · rupshasports.com.bd</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Retail · Growth</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#ffece5", color: "#c2410c", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>Suspended · storefront paused</span>
                    </div>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Viewing is off while suspended</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Reactivation steps</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#475569" }}>Archived</span>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minHeight: "72px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-lg)", background: "#94a3b8", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>AF</span>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Adda Foods</div>
                      <div className="mono" style={{ color: "var(--text-muted)" }}>tenant 0021 · archived 02 Jul 2026</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#e0e6f1", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>Online · Growth</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <circle cx="10" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
</svg>Archived · history only</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                      <button className="btn ghost" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Restore store</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section style={{ padding: "64px 80px 80px", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "24px" }}>
            <div className="card" style={{ padding: "28px 32px" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Anatomy</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Five parts, left to right</h2>
              <div style={{ marginTop: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "12px", padding: "12px 0", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Identity</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Store initials, name, tenant number and live domain. The tenant number is what support quotes in tickets.</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "12px", padding: "12px 0", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Plan</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Segment and plan in one navy pill, with trial marked inside it.</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "12px", padding: "12px 0", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>State</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Subscription state with shape and word; the most urgent state shows first.</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "12px", padding: "12px 0", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Health</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Score and band, linked to the health breakdown.</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "12px", padding: "12px 0", borderTop: "1px solid #eef2f7" }}>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Actions</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>Storefront, switch store, and the one primary action: ask to view the store.</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: "28px 32px" }}>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "#0070a0" }}>Rules</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Viewing a store</h2>
              <ul style={{ margin: "18px 0 0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>The owner's consent opens every session; staff cannot start one alone.</span>
                </li>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>Sessions are read-only. Edit access needs a reason code and a second staff approval.</span>
                </li>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>Thirty minutes by default; the owner can end it at any time from their admin.</span>
                </li>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>The banner cannot be dismissed or scrolled away, and it shows in every tab.</span>
                </li>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>Closing the tab ends the session. Every page opened is logged with time and path.</span>
                </li>
                <li style={{ display: "flex", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#475569" }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "6px", height: "6px", marginTop: "8px", borderRadius: "2px", background: "#ff9800" }} />
                  <span>Viewing is off for suspended and archived stores.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
