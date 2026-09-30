'use client';
// Generated from design/templates/dev-reference/UIKit07Feedback.dc.html by scripts/convert-design.mjs.
// UI kit 07 · Feedback & overlays — UI kit — Feedback & overlays.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var v = { demo: function () { toast(self, 'Saved. 3 products updated.'); }, demoBad: function () { toast(self, 'Two people are off on 25 Sep at Dhanmondi.', true); } };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.kspec{overflow:visible}.kspec th,.kspec td{white-space:normal}

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

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}

.tc{background:#fff;border:1px solid #e7ebf2;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -20px rgba(15,23,42,.18)}
.ey{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ey-d{color:rgba(203,216,238,.7)}
.tn{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:0}
.dl{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.hero{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:#0b1733;color:#fff;padding:24px 26px}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.hero>*{position:relative}
.ht{border-radius:var(--radius-xl);background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.dseg{display:inline-flex;padding:3px;border-radius:var(--radius-full);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.dseg button{height:32px;padding:0 14px;border:0;border-radius:var(--radius-full);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}
.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease,box-shadow 200ms ease}
button:active,.btn:active,.abtn:active{transform:scale(.97)}
.btn,.abtn{transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.st>*{animation:taUp 420ms cubic-bezier(.23,1,.32,1) both}
.st>*:nth-child(2){animation-delay:40ms}.st>*:nth-child(3){animation-delay:80ms}.st>*:nth-child(4){animation-delay:120ms}.st>*:nth-child(5){animation-delay:160ms}.st>*:nth-child(6){animation-delay:200ms}.st>*:nth-child(7){animation-delay:240ms}.st>*:nth-child(8){animation-delay:280ms}
@keyframes taUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gr{transform-origin:left center;animation:taGrow 700ms cubic-bezier(.23,1,.32,1) both}
@keyframes taGrow{from{transform:scaleX(.35);opacity:0}to{transform:none;opacity:1}}
.draw{stroke-dasharray:1600;stroke-dashoffset:0;animation:taDraw 1100ms cubic-bezier(.77,0,.175,1) both}
@keyframes taDraw{from{stroke-dashoffset:1600}to{stroke-dashoffset:0}}
.fadein{animation:taFade 600ms ease both 200ms}@keyframes taFade{from{opacity:0}to{opacity:1}}
.tt{position:relative}
.tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px) scale(.97);transform-origin:bottom center;opacity:0;pointer-events:none;transition:opacity 125ms ease-out,transform 125ms ease-out;background:#0b1733;color:#fff;border-radius:var(--radius-lg);padding:8px 10px;font-size:var(--text-xs);white-space:nowrap;box-shadow:0 10px 24px -8px rgba(15,23,42,.45);z-index:5}
.col{position:relative;flex:1;height:100%;border-radius:var(--radius-md);transition:background-color 150ms ease}
.col .tip{bottom:auto;top:6px}
.col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(15,23,42,.18);opacity:0;transition:opacity 125ms ease}
@media (hover:hover) and (pointer:fine){.tt:hover .tip,.col:hover .tip{opacity:1;transform:translate(-50%,0) scale(1)}.col:hover .cl{opacity:1}.row:hover{background:#f7f9fd}.tc.lift{transition:box-shadow 200ms ease,transform 200ms cubic-bezier(.23,1,.32,1)}.tc.lift:hover{box-shadow:0 1px 2px rgba(15,23,42,.05),0 18px 40px -20px rgba(15,23,42,.3)}}
.tb{width:100%;border-collapse:separate;border-spacing:0}
.tb th{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe;white-space:nowrap}
.tb td{padding:13px 16px;border-bottom:1px solid #f1f4f8;font-size:var(--text-sm);vertical-align:middle}
.tb tr:last-child td{border-bottom:0}
.tb .r{text-align:right}
@media (prefers-reduced-motion:reduce){.st>*,.gr,.draw,.fadein{animation:none}}

.kdoc{width:1440px;background:#f4f6fa;font-family:var(--font-sans);color:#334155}
.ksec{padding:36px 48px 8px;display:flex;flex-direction:column;gap:20px}
.ksh{display:flex;align-items:flex-end;gap:16px;padding-bottom:14px;border-bottom:1px solid #e3e8ef}
.knum{font-size:var(--text-xs);font-weight:var(--weight-medium);color:#0a5bd0;letter-spacing:var(--tracking-label)}
.kspec{background:#fff;border:1px solid #e7ebf2;border-radius:var(--radius-xl);overflow:hidden;display:flex;flex-direction:column}
.kspec-h{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe}
.kspec-b{padding:22px;display:flex;flex-direction:column;gap:14px}
.kspec-f{padding:10px 16px;border-top:1px solid #eef1f6;background:#fbfcfe;font-size:var(--text-xs);color:var(--text-muted);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.kcode{font-family:var(--font-data);font-size:var(--text-xs);padding:2px 7px;border-radius:var(--radius-md);background:#eef2f8;color:#1e3a8a}
.ktag{height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;letter-spacing:.04em}
.kgrid{display:grid;gap:18px}
.klbl{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ghost{background:transparent;color:#334155}.ghost:hover{background:#f1f5f9}
.danger{background:#be123c;color:#fff}.danger:hover{background:#9f1239;color:#fff}
.succ{background:#047857;color:#fff}
.inp.err{border-color:#e11d48;background:#fff8f9}.inp.ok{border-color:#10b981}
.inp[disabled]{background:#f1f5f9;color:var(--text-muted);cursor:not-allowed}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.sk{background:linear-gradient(90deg,#eef1f6 25%,#f7f9fc 37%,#eef1f6 63%);background-size:400% 100%;animation:skel 1.4s ease infinite;border-radius:var(--radius-lg)}
@keyframes skel{0%{background-position:100% 50%}100%{background-position:0 50%}}
.spin{animation:spin 700ms linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
`;

// ---- markup ----

export default class UIKit07FeedbackScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit07Feedback">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3400px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 07 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>{"Feedback & overlays"}</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Alerts, banners, toasts, modals, menus, popovers, tooltips, drawers, empty and locked states, setup checklists, notifications — and the motion rules behind them.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s71">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Messages on the page</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Tell people what happened in one short sentence, then what to do.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Inline alerts · 4 tones</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Core</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#075985" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}><b>Info.</b> Stock count for aisle B starts at 6:00 PM today.</span>
                      <span style={{ opacity: ".7" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#065f46" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}><b>Success.</b> Payroll for September approved.</span>
                      <span style={{ opacity: ".7" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#7a3b04" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}><b>Warning.</b> TikTok token expires in 6 days.</span>
                      <span style={{ opacity: ".7" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#9f1239" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m4.9 4.9 14.2 14.2" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}><b>Error.</b> Payment failed — bKash did not answer.</span>
                      <span style={{ opacity: ".7" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">info #e0f3fb</code>
                  {" "}
                  <code className="kcode">success #e7f8f1</code>
                  {" "}
                  <code className="kcode">warning #fff4e0</code>
                  {" "}
                  <code className="kcode">error #ffece6</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Page banner & alert card"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff" }}>
                    <span style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(251,191,36,.18)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontWeight: "var(--weight-semibold)" }}>Your free trial ends in 5 days</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "rgba(203,216,238,.8)" }}>Keep POS, payroll and analytics — ৳1,490 / month.</div>
                    </div>
                    <span className="btn sm" style={{ background: "#fff", color: "#0b1733" }}>Choose a plan</span>
                  </div>
                  <div className="tc" style={{ display: "flex", gap: "12px", padding: "14px 16px", borderRadius: "var(--radius-xl)", borderColor: "#fecdd3" }}>
                    <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontWeight: "var(--weight-medium)" }}>“Add to wishlist” stopped firing on Meta</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Nothing since 17 Sep, 4:12 PM.</div>
                    </div>
                    <span className="btn solid sm">Check</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> account-level notices, issues that need a fix.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s72">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Toasts and status messages</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Toasts sit bottom-right for 3 seconds, stack upwards, and pause on hover. The in-page message bar sits under the header.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Toasts</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "340px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff", boxShadow: "0 16px 32px -14px rgba(15,23,42,.45)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>Order GC-24817 marked delivered</span>
                      <span style={{ fontWeight: "var(--weight-semibold)", color: "#93c5fd" }}>Undo</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "340px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fff", color: "#0f172a", boxShadow: "0 16px 32px -14px rgba(15,23,42,.45)" }}>
                      <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003087" strokeWidth="2.5" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-6.2-8.56" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>Sending payslips to 13 staff…</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "340px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#9f1239", color: "#fff", boxShadow: "0 16px 32px -14px rgba(15,23,42,.45)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>Couldn’t print — printer offline</span>
                      <span style={{ fontWeight: "var(--weight-semibold)" }}>Retry</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">bottom-right</code>
                  {" "}
                  <code className="kcode">3 s</code>
                  {" "}
                  <code className="kcode">enter 250ms ease-out from 100%</code>
                  {" "}
                  <code className="kcode">exit 150ms</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Message bar (live)</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Try it</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  {v.hasMsg ? (<>
                    <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>{v.msg}</span>
                    </div>
                  </>) : null}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="btn solid" onClick={v.demo}>Show a message</button>
                    <button type="button" className="btn line" onClick={v.demoBad}>Show a warning</button>
                  </div>
                  <div className="fade" role="status" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", color: "#065f46", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Warranty policy published as version 4.</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">toast(self, text, bad)</code>
                  {" "}
                  <code className="kcode">msgbar()</code>
                  {" "}
                  <code className="kcode">{"role=\"status\""}</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s73">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.3</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Modals</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Modals stop everything, so use them only to confirm, to warn, or to celebrate a finished job. They appear from 96% scale in 200 ms and stay centred.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Confirm</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "26px", borderRadius: "var(--radius-xl)", background: "rgba(15,23,42,.45)" }}>
                    <div style={{ maxWidth: "420px", margin: "0 auto", background: "#fff", borderRadius: "var(--radius-xl)", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.5)" }}>
                      <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>Send 3 orders to Pathao?</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "#475569", lineHeight: "20px" }}>A pickup will be booked for tomorrow 11:00 AM. You can cancel until the rider arrives.</div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <span className="btn ghost">Cancel</span>
                        <span className="btn solid">Send to Pathao</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">modal 420</code>
                  {" "}
                  <code className="kcode">Esc closes</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Destructive · type to confirm</span>
                  <span className="ktag" style={{ background: "#ffece6", color: "#9f1239" }}>Careful</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "26px", borderRadius: "var(--radius-xl)", background: "rgba(15,23,42,.45)" }}>
                    <div style={{ maxWidth: "420px", margin: "0 auto", background: "#fff", borderRadius: "var(--radius-xl)", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.5)" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                          </svg>
                        </span>
                        <div>
                          <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>Offboard Sadia Akter?</div>
                          <div style={{ fontSize: "var(--text-sm)", color: "#475569", lineHeight: "20px", marginTop: "4px" }}>Removes her access for good and starts final settlement. Type <b>OFFBOARD</b> to confirm.</div>
                        </div>
                      </div>
                      <input className="inp mono" defaultValue="OFFB" aria-label="Type OFFBOARD" />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <span className="btn ghost">Cancel</span>
                        <button type="button" className="btn danger" disabled>Offboard</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> deleting, offboarding, voiding.</span>
                  <code className="kcode">.danger</code>
                  {" "}
                  <code className="kcode">disabled until typed</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Success</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "26px", borderRadius: "var(--radius-xl)", background: "rgba(15,23,42,.45)" }}>
                    <div style={{ maxWidth: "360px", margin: "0 auto", background: "#fff", borderRadius: "var(--radius-xl)", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.5)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", padding: "8px" }}>
                        <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>Stock count saved</div>
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>4 differences were fixed. Loss of ৳1,240 recorded.</div>
                        <span className="btn solid" style={{ width: "100%" }}>Done</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> end of a long task.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s74">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.4</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Menus, popovers, tooltips and drawers</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Menus and popovers grow from the button that opened them (transform-origin), in 150–200 ms. Tooltips wait 400 ms the first time, then show instantly.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Dropdown menu</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", height: "230px" }}>
                    <span className="btn line sm">Actions<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m6 9 6 6 6-6" />
</svg></span>
                    <div style={{ position: "absolute", left: "0", top: "44px", width: "230px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", boxShadow: "0 16px 32px -12px rgba(15,23,42,.3)", padding: "6px", transformOrigin: "top left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", color: "#0f172a", background: "#f5f8ff" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Print invoice</span>
                        <span className="kcode" style={{ fontSize: "var(--text-2xs)" }}>P</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", color: "#0f172a", background: "transparent" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                          <path d="M15 18H9" />
                          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                          <circle cx="17" cy="18" r="2" />
                          <circle cx="7" cy="18" r="2" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Send to courier</span>
                        <span className="kcode" style={{ fontSize: "var(--text-2xs)" }}>S</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", color: "#0f172a", background: "transparent" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="14" height="14" x="8" y="8" rx="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Duplicate</span>
                        <span className="kcode" style={{ fontSize: "var(--text-2xs)" }} />
                      </div>
                      <div style={{ height: "1px", background: "#eef1f6", margin: "4px 0" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", color: "#be123c", background: "transparent" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Cancel order</span>
                        <span className="kcode" style={{ fontSize: "var(--text-2xs)" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">origin: trigger</code>
                  {" "}
                  <code className="kcode">150ms ease-out</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Popover</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", height: "230px", display: "flex", alignItems: "flex-end" }}>
                    <span className="btn line sm" style={{ marginLeft: "20px" }}>Columns</span>
                    <div style={{ position: "absolute", left: "0", bottom: "48px", width: "250px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", boxShadow: "0 16px 32px -12px rgba(15,23,42,.3)", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", transformOrigin: "bottom left" }}>
                      <span className="klbl">Show columns</span>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#003087", border: "2px solid #003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>Order<span style={{ marginLeft: "auto", color: "#cbd5e1" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
</span></label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#003087", border: "2px solid #003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>Customer<span style={{ marginLeft: "auto", color: "#cbd5e1" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
</span></label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#003087", border: "2px solid #003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>Total<span style={{ marginLeft: "auto", color: "#cbd5e1" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
</span></label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "2px solid #cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} />Branch<span style={{ marginLeft: "auto", color: "#cbd5e1" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
</span></label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "2px solid #cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} />Courier<span style={{ marginLeft: "auto", color: "#cbd5e1" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
</span></label>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">column chooser</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Tooltips</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", height: "120px", paddingLeft: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <span className="ib" style={{ background: "#f1f5f9" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                      </span>
                      <div style={{ position: "absolute", bottom: "50px", left: "50%", transform: "translateX(-50%)", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs)", padding: "6px 10px", borderRadius: "var(--radius-lg)", whiteSpace: "nowrap" }}>Print · P<span style={{ position: "absolute", left: "50%", bottom: "-4px", width: "8px", height: "8px", marginLeft: "-4px", background: "#0b1733", transform: "rotate(45deg)" }} /></div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span className="ib" style={{ background: "#f1f5f9" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                      </span>
                      <div style={{ position: "absolute", bottom: "50px", left: "50%", transform: "translateX(-50%)", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs)", padding: "6px 10px", borderRadius: "var(--radius-lg)", whiteSpace: "nowrap" }}>Real return = revenue after courier and returns ÷ ad spend<span style={{ position: "absolute", left: "50%", bottom: "-4px", width: "8px", height: "8px", marginLeft: "-4px", background: "#0b1733", transform: "rotate(45deg)" }} /></div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> icon buttons and jargon.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Drawer</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", height: "230px", borderRadius: "var(--radius-xl)", background: "#eef2f7", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: "0", background: "rgba(15,23,42,.25)" }} />
                    <div style={{ position: "absolute", top: "0", right: "0", bottom: "0", width: "60%", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "-20px 0 40px -20px rgba(15,23,42,.4)" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <b style={{ flexGrow: "1" }}>GC-24817</b>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </div>
                      <div className="sk" style={{ height: "12px" }} />
                      <div className="sk" style={{ height: "12px", width: "70%" }} />
                      <div className="sk" style={{ height: "80px" }} />
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">from right</code>
                  {" "}
                  <code className="kcode">250ms ease-out</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s75">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.5</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Empty, locked and offline</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Never leave a blank page. Say what goes here and give one next step.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>First time</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", padding: "24px 12px" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>No products yet</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", maxWidth: "260px" }}>Add your first product, or bring them in from a spreadsheet.</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span className="btn line sm">Import CSV</span>
                      <span className="btn solid sm">Add product</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Nothing to do</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", padding: "24px 12px" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>All caught up</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", maxWidth: "260px" }}>No leave requests are waiting for you.</div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Locked / add-on</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", padding: "24px 12px" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "#f3e8ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>Payroll is an add-on</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", maxWidth: "260px" }}>Pay staff by bank, bKash or cash, with payslips.</div>
                    <span className="btn solid sm">Turn on HR add-on</span>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Offline</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", padding: "24px 12px" }}>
                    <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>You’re offline</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", maxWidth: "260px" }}>Sales are saved on this device and sync when the internet is back.</div>
                    <span className="btn line sm">Try again</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s76">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">7.6</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Guidance, notifications and motion</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }} />
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Setup checklist</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#f7f9fc" }}>
                      <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", border: "2px solid #10b981", background: "var(--fill-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "line-through" }}>Add your shop name and logo</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#f7f9fc" }}>
                      <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", border: "2px solid #10b981", background: "var(--fill-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "line-through" }}>Add 5 products</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                      <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", border: "2px solid #cbd5e1", background: "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Connect bKash</span>
                      <span style={{ color: "#003087" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#fff" }}>
                      <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", border: "2px solid #cbd5e1", background: "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Set delivery charges</span>
                      <span style={{ color: "#003087" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> first days of a new shop.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Notification centre</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #eef1f6" }}>
                      <b style={{ flexGrow: "1" }}>Notifications</b>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "#003087", fontWeight: "var(--weight-medium)" }}>Mark all read</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "12px 14px", background: "#f5f8ff", borderBottom: "1px solid #f1f4f8" }}>
                      <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-xs-plus)" }}><b>7 products</b> are low on stock</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>5 min ago</div>
                      </div>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#003087", marginTop: "6px" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "12px 14px", background: "#f5f8ff", borderBottom: "1px solid #f1f4f8" }}>
                      <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-xs-plus)" }}>New order <b>GC-24818</b> · ৳2,140</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>12 min ago</div>
                      </div>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#003087", marginTop: "6px" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "12px 14px", background: "#fff", borderBottom: "1px solid #f1f4f8" }}>
                      <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-xs-plus)" }}>Rafi Ahmed asked for 2 days off</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1 h ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Motion rules</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>What</th>
                        <th>Duration</th>
                        <th>Easing</th>
                        <th>From</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Button press</td>
                        <td className="tn">160 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>cubic-bezier(.23,1,.32,1)</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>scale .97</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Tooltip</td>
                        <td className="tn">125 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>ease-out</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>scale .97 + fade</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Menu, popover</td>
                        <td className="tn">150–200 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>ease-out</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>scale .95 from trigger</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Modal</td>
                        <td className="tn">200 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>ease-out</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>scale .96 + fade</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Drawer, toast</td>
                        <td className="tn">250 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>cubic-bezier(.32,.72,0,1)</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>translate 100%</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Chart draw</td>
                        <td className="tn">700–1100 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>cubic-bezier(.77,0,.175,1)</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>once on load</td>
                      </tr>
                      <tr className="row">
                        <td style={{ fontWeight: "var(--weight-medium)" }}>Keyboard actions</td>
                        <td className="tn">0 ms</td>
                        <td className="mono" style={{ fontSize: "var(--text-xs)" }}>—</td>
                        <td style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>never animate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="kspec-f">
                  <code className="kcode">prefers-reduced-motion: fade only</code>
                </div>
              </div>
            </div>
          </section>
          <footer style={{ marginTop: "40px", padding: "22px 48px", borderTop: "1px solid #e3e8ef", display: "flex", gap: "16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
            <span>GridCommerce UI kit</span>
            <span>Poppins + Hind Siliguri · BDT ৳ · Asia/Dhaka</span>
            <span style={{ flexGrow: "1" }} />
            <span>Every class here is live — copy the markup from the specimen.</span>
          </footer>
        </div>
      </div>
    );
  }
}
