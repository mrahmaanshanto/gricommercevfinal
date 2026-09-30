'use client';
// Generated from design/templates/dev-reference/UIKit05Tables.dc.html by scripts/convert-design.mjs.
// UI kit 05 · Tables — UI kit — Tables & lists.
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
    var v = {};
    return assign(v, msgV(s));
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

export default class UIKit05TablesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit05Tables">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3300px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 05 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>{"Tables & lists"}</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Standard, compact, analytics, expandable, row cards, editable grid, list + detail, board, card grid, timeline and tree — with toolbars, bulk actions, pagination and loading, empty, no-result and error states.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s51">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">5.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Tables and lists</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Eleven ways to show many records, plus the four states every list needs.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A · Standard data table</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Default</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderBottom: "1px solid #eef1f6" }}>
                      <div style={{ position: "relative", width: "260px" }}>
                        <span style={{ position: "absolute", left: "10px", top: "9px", color: "var(--text-muted)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </span>
                        <input className="inp" placeholder="Search orders" aria-label="Search" style={{ height: "36px", paddingLeft: "34px" }} />
                      </div>
                      <span className="chip" style={{ height: "36px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
</svg>Status: all</span>
                      <span className="chip" style={{ height: "36px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M16 2v4" />
  <path d="M8 2v4" />
  <path d="M3 10h18" />
</svg>Last 7 days</span>
                      <span style={{ flexGrow: "1" }} />
                      <span className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M15 3v18" />
</svg>Columns</span>
                      <span className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>CSV</span>
                      <span className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
  <rect x="6" y="14" width="12" height="8" rx="1" />
</svg>Print</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs-plus)" }}>
                      <b>2 selected</b>
                      <span style={{ flexGrow: "1" }} />
                      <span className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Print labels</span>
                      <span className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Send to courier</span>
                      <span className="btn sm" style={{ background: "#fff", color: "#0b1733" }}>Mark confirmed</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th">
                            <input type="checkbox" aria-label="Select all" style={{ width: "17px", height: "17px" }} />
                          </th>
                          <th className="th">Order <span style={{ color: "#003087" }}>↓</span></th>
                          <th className="th">Customer</th>
                          <th className="th" style={{ textAlign: "right" }}>Total</th>
                          <th className="th">Payment</th>
                          <th className="th">Status</th>
                          <th className="th">Date</th>
                          <th className="th" style={{ textAlign: "right" }} />
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="row" style={{ background: "#f5f8ff" }}>
                          <td className="td" style={{ width: "40px" }}>
                            <input type="checkbox" defaultChecked="" aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                          </td>
                          <td className="td mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>GC-24817</td>
                          <td className="td">Rahima K.<div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Dhanmondi</div></td>
                          <td className="td tn" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>৳1,290</td>
                          <td className="td">COD</td>
                          <td className="td">
                            <span className="badge" style={{ background: "#e7f8f1", color: "#047857" }}>Delivered</span>
                          </td>
                          <td className="td" style={{ color: "var(--text-muted)" }}>16 Sep</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="ib" style={{ width: "32px", height: "32px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </span>
                          </td>
                        </tr>
                        <tr className="row" style={{ background: "#f5f8ff" }}>
                          <td className="td" style={{ width: "40px" }}>
                            <input type="checkbox" defaultChecked="" aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                          </td>
                          <td className="td mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>GC-24816</td>
                          <td className="td">Imran H.<div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Mirpur</div></td>
                          <td className="td tn" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>৳4,850</td>
                          <td className="td">bKash</td>
                          <td className="td">
                            <span className="badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>Shipped</span>
                          </td>
                          <td className="td" style={{ color: "var(--text-muted)" }}>16 Sep</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="ib" style={{ width: "32px", height: "32px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </span>
                          </td>
                        </tr>
                        <tr className="row">
                          <td className="td" style={{ width: "40px" }}>
                            <input type="checkbox" aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                          </td>
                          <td className="td mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>GC-24815</td>
                          <td className="td">Nabila S.<div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Uttara</div></td>
                          <td className="td tn" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>৳720</td>
                          <td className="td">COD</td>
                          <td className="td">
                            <span className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>Confirmed</span>
                          </td>
                          <td className="td" style={{ color: "var(--text-muted)" }}>15 Sep</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="ib" style={{ width: "32px", height: "32px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </span>
                          </td>
                        </tr>
                        <tr className="row">
                          <td className="td" style={{ width: "40px" }}>
                            <input type="checkbox" aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                          </td>
                          <td className="td mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>GC-24814</td>
                          <td className="td">Tanvir A.<div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sylhet</div></td>
                          <td className="td tn" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>৳2,340</td>
                          <td className="td">Card</td>
                          <td className="td">
                            <span className="badge" style={{ background: "#fff4e0", color: "#a14f06" }}>Pending</span>
                          </td>
                          <td className="td" style={{ color: "var(--text-muted)" }}>15 Sep</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="ib" style={{ width: "32px", height: "32px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </span>
                          </td>
                        </tr>
                        <tr className="row">
                          <td className="td" style={{ width: "40px" }}>
                            <input type="checkbox" aria-label="Select" style={{ width: "17px", height: "17px", accentColor: "#003087" }} />
                          </td>
                          <td className="td mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>GC-24811</td>
                          <td className="td">Arif H.<div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Chattogram</div></td>
                          <td className="td tn" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>৳980</td>
                          <td className="td">COD</td>
                          <td className="td">
                            <span className="badge" style={{ background: "#ffece6", color: "#b83210" }}>Returned</span>
                          </td>
                          <td className="td" style={{ color: "var(--text-muted)" }}>14 Sep</td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="ib" style={{ width: "32px", height: "32px" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderTop: "1px solid #eef1f6", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                      <span style={{ flexGrow: "1" }}>1–25 of 240</span>
                      <span className="abtn">‹ Prev</span>
                      <span style={{ width: "6px" }} />
                      <span className="abtn">Next ›</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> most list pages.</span>
                  <code className="kcode">.th</code>
                  {" "}
                  <code className="kcode">.td</code>
                  {" "}
                  <code className="kcode">.row</code>
                  {" "}
                  <code className="kcode">bulk bar on select</code>
                  {" "}
                  <code className="kcode">sort arrow</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"B · Compact & striped"}</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Dense</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs-plus)" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>Product</th>
                        <th style={{ textAlign: "left", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>SKU</th>
                        <th style={{ textAlign: "left", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>Bin</th>
                        <th style={{ textAlign: "right", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>System</th>
                        <th style={{ textAlign: "right", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>Counted</th>
                        <th style={{ textAlign: "right", padding: "8px 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", borderBottom: "1px solid #e2e8f0" }}>Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: "#fff" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Sunscreen SPF50</td>
                        <td style={{ padding: "7px 10px" }} className="mono">S-1040</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Rack A-03-2</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">84</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">80</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }} className="tn">+4</td>
                      </tr>
                      <tr style={{ background: "#f8fafc" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Toner 150ml</td>
                        <td style={{ padding: "7px 10px" }} className="mono">T-1022</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Rack A-04-1</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">31</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">33</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#be123c" }} className="tn">−2</td>
                      </tr>
                      <tr style={{ background: "#fff" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Mango Pickle 400g</td>
                        <td style={{ padding: "7px 10px" }} className="mono">FD-PKL-400</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Rack E-1</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">86</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">86</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }} className="tn">0</td>
                      </tr>
                      <tr style={{ background: "#f8fafc" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Galaxy A55 5G</td>
                        <td style={{ padding: "7px 10px" }} className="mono">PH-A55-256</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Cage P-1</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">12</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">12</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }} className="tn">0</td>
                      </tr>
                      <tr style={{ background: "#fff" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Milk Biscuits</td>
                        <td style={{ padding: "7px 10px" }} className="mono">MB-0719</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Rack B-12-3</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">42</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">40</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }} className="tn">+2</td>
                      </tr>
                      <tr style={{ background: "#f8fafc" }}>
                        <td style={{ padding: "7px 10px", fontWeight: "var(--weight-medium)" }}>Honey 500g</td>
                        <td style={{ padding: "7px 10px" }} className="mono">HN-0301</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-muted)" }}>Rack E-2</td>
                        <td style={{ padding: "7px 10px", textAlign: "right" }} className="tn">4</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)" }} className="tn">5</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#be123c" }} className="tn">−1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> stock counts, reports, printing — lots of rows.</span>
                  <code className="kcode">row 32px</code>
                  {" "}
                  <code className="kcode">zebra #f8fafc</code>
                  {" "}
                  <code className="kcode">12.5px text</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>C · Analytics table</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Premium</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Trend</th>
                        <th className="r">Spend</th>
                        <th>Real return</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ width: "4px", height: "30px", borderRadius: "var(--radius-sm)", background: "#2563eb" }} />
                            <img src="/assets/41f77fbf774c3a1c10208ca2b086bc14.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                            <div>
                              <div style={{ fontWeight: "var(--weight-medium)" }}>Eid gift box</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Advantage+</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <svg width="90" height="26" viewBox="0 0 90 26" aria-hidden="true">
                            <path d="M0.0 24.0 L15.0 18.8 L30.0 18.8 L45.0 13.5 L60.0 8.2 L75.0 8.2 L90.0 3.0 L90 26 L0 26 Z" fill="#059669" fillOpacity=".12" />
                            <path d="M0.0 24.0 L15.0 18.8 L30.0 18.8 L45.0 13.5 L60.0 8.2 L75.0 8.2 L90.0 3.0" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
                          </svg>
                        </td>
                        <td className="r tn">৳38,400</td>
                        <td style={{ width: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                              <div style={{ width: "88%", height: "100%", borderRadius: "var(--radius-full)", background: "#059669" }} />
                            </div>
                            <span className="tn" style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-success)" }}>5.3×</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ width: "4px", height: "30px", borderRadius: "var(--radius-sm)", background: "#059669" }} />
                            <img src="/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                            <div>
                              <div style={{ fontWeight: "var(--weight-medium)" }}>Shopping · all</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Performance Max</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <svg width="90" height="26" viewBox="0 0 90 26" aria-hidden="true">
                            <path d="M0.0 24.0 L15.0 24.0 L30.0 3.0 L45.0 24.0 L60.0 3.0 L75.0 3.0 L90.0 3.0 L90 26 L0 26 Z" fill="#059669" fillOpacity=".12" />
                            <path d="M0.0 24.0 L15.0 24.0 L30.0 3.0 L45.0 24.0 L60.0 3.0 L75.0 3.0 L90.0 3.0" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
                          </svg>
                        </td>
                        <td className="r tn">৳22,400</td>
                        <td style={{ width: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                              <div style={{ width: "72%", height: "100%", borderRadius: "var(--radius-full)", background: "#059669" }} />
                            </div>
                            <span className="tn" style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-success)" }}>4.3×</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ width: "4px", height: "30px", borderRadius: "var(--radius-sm)", background: "#db2777" }} />
                            <img src="/assets/57bb10142b6017571910098da3778028.png" alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                            <div>
                              <div style={{ fontWeight: "var(--weight-medium)" }}>Live Friday</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Shop ads</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <svg width="90" height="26" viewBox="0 0 90 26" aria-hidden="true">
                            <path d="M0.0 3.0 L15.0 3.0 L30.0 13.5 L45.0 13.5 L60.0 13.5 L75.0 24.0 L90.0 24.0 L90 26 L0 26 Z" fill="#e11d48" fillOpacity=".12" />
                            <path d="M0.0 3.0 L15.0 3.0 L30.0 13.5 L45.0 13.5 L60.0 13.5 L75.0 24.0 L90.0 24.0" fill="none" stroke="#e11d48" strokeWidth="1.6" strokeLinejoin="round" />
                          </svg>
                        </td>
                        <td className="r tn">৳8,000</td>
                        <td style={{ width: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                              <div style={{ width: "30%", height: "100%", borderRadius: "var(--radius-full)", background: "#e11d48" }} />
                            </div>
                            <span className="tn" style={{ fontWeight: "var(--weight-semibold)", color: "#e11d48" }}>1.8×</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> money and performance numbers.</span>
                  <code className="kcode">.tb</code>
                  {" "}
                  <code className="kcode">sparkline 90×26</code>
                  {" "}
                  <code className="kcode">inline bar</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>D · Expandable rows</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                    <div style={{ borderBottom: "1px solid #eef1f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f8fafc" }}>
                        <span style={{ color: "var(--text-muted)", transform: "rotate(90deg)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                        <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>GC-24817</span>
                        <span style={{ flexGrow: "1", color: "#475569" }}>Rahima K.</span>
                        <span className="badge" style={{ background: "#e7f8f1", color: "#047857" }}>Delivered</span>
                        <span className="tn" style={{ fontWeight: "var(--weight-semibold)", width: "80px", textAlign: "right" }}>৳1,290</span>
                      </div>
                      <div style={{ padding: "4px 14px 12px 42px" }}>
                        <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px dashed #e2e8f0", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ flexGrow: "1" }}>Sunscreen SPF50 50ml</span>
                          <span className="tn" style={{ color: "var(--text-muted)" }}>× 2</span>
                          <span className="tn" style={{ width: "70px", textAlign: "right" }}>৳1,160</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px dashed #e2e8f0", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ flexGrow: "1" }}>Delivery · Dhaka</span>
                          <span className="tn" style={{ color: "var(--text-muted)" }}>× 1</span>
                          <span className="tn" style={{ width: "70px", textAlign: "right" }}>৳60</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderBottom: "1px solid #eef1f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#fff" }}>
                        <span style={{ color: "var(--text-muted)", transform: "rotate(0deg)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                        <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>GC-24816</span>
                        <span style={{ flexGrow: "1", color: "#475569" }}>Imran H.</span>
                        <span className="badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>Shipped</span>
                        <span className="tn" style={{ fontWeight: "var(--weight-semibold)", width: "80px", textAlign: "right" }}>৳4,850</span>
                      </div>
                    </div>
                    <div style={{ borderBottom: "1px solid #eef1f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#fff" }}>
                        <span style={{ color: "var(--text-muted)", transform: "rotate(0deg)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                        <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>GC-24815</span>
                        <span style={{ flexGrow: "1", color: "#475569" }}>Nabila S.</span>
                        <span className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>Confirmed</span>
                        <span className="tn" style={{ fontWeight: "var(--weight-semibold)", width: "80px", textAlign: "right" }}>৳720</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> orders with items, POs with lines.</span>
                  <code className="kcode">chevron rotates 90° · 200ms</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>E · Row cards</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", background: "#fff" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>RA</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontWeight: "var(--weight-medium)" }}>Rafi Ahmed</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>24–25 Sep · cousin’s wedding</div>
                      </div>
                      <span className="badge" style={{ background: "#e0f3fb", color: "#075985" }}>Casual</span>
                      <span className="btn line sm">Reject</span>
                      <span className="btn solid sm">Approve</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", background: "#fff" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>MD</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontWeight: "var(--weight-medium)" }}>Moumita Das</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>19–21 Sep · doctor’s note</div>
                      </div>
                      <span className="badge" style={{ background: "#ffece6", color: "#b83210" }}>Sick</span>
                      <span className="btn line sm">Reject</span>
                      <span className="btn solid sm">Approve</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> things to approve — each needs a decision.</span>
                  <code className="kcode">card row 14px padding</code>
                  {" "}
                  <code className="kcode">actions on the right</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>F · Editable grid</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Bulk edit</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs-plus)" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", background: "#f8fafc", border: "1px solid #e2e8f0" }}>Product</th>
                        <th style={{ textAlign: "right", padding: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", background: "#f8fafc", border: "1px solid #e2e8f0" }}>Cost</th>
                        <th style={{ textAlign: "right", padding: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", background: "#f8fafc", border: "1px solid #e2e8f0" }}>Price</th>
                        <th style={{ textAlign: "right", padding: "8px", fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-label)", background: "#f8fafc", border: "1px solid #e2e8f0" }}>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "0 8px", height: "36px", border: "1px solid #e2e8f0" }}>Sunscreen SPF50</td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right" }} className="tn">৳300</td>
                        <td style={{ padding: "0", border: "1px solid #e2e8f0", textAlign: "right", background: "#fff" }} className="tn">
                          <span style={{ display: "block", padding: "0 8px" }}>৳580</span>
                        </td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right", color: "#047857", fontWeight: "var(--weight-semibold)" }} className="tn">48%</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0 8px", height: "36px", border: "1px solid #e2e8f0" }}>Toner 150ml</td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right" }} className="tn">৳390</td>
                        <td style={{ padding: "0", border: "2px solid #003087", textAlign: "right", background: "#f5f8ff" }} className="tn">
                          <span style={{ display: "block", padding: "0 8px" }}>৳690|</span>
                        </td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right", color: "#047857", fontWeight: "var(--weight-semibold)" }} className="tn">43%</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0 8px", height: "36px", border: "1px solid #e2e8f0" }}>Honey 500g</td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right" }} className="tn">৳380</td>
                        <td style={{ padding: "0", border: "1px solid #e2e8f0", textAlign: "right", background: "#fff" }} className="tn">
                          <span style={{ display: "block", padding: "0 8px" }}>৳420</span>
                        </td>
                        <td style={{ padding: "0 8px", border: "1px solid #e2e8f0", textAlign: "right", color: "#b45309", fontWeight: "var(--weight-semibold)" }} className="tn">10%</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Tab moves right · Enter moves down · changed cells turn blue until saved</div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> bulk price or stock updates.</span>
                  <code className="kcode">cell 36px</code>
                  {" "}
                  <code className="kcode">active cell 2px #003087</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>G · List + detail</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", overflow: "hidden", height: "300px" }}>
                    <div style={{ width: "45%", borderRight: "1px solid #eef1f6" }}>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f4f8", background: "#f5f8ff", borderLeft: "3px solid #003087" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>WC-0318</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2 days</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Galaxy A55 · screen flickers</div>
                      </div>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f4f8", background: "#fff", borderLeft: "3px solid transparent" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>WC-0317</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>5 days</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Redmi Note 13 · battery</div>
                      </div>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f4f8", background: "#fff", borderLeft: "3px solid transparent" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>WC-0315</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8 days</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Laptop · keyboard</div>
                      </div>
                    </div>
                    <div style={{ flexGrow: "1", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", flexGrow: "1" }}>WC-0318</span>
                        <span className="badge" style={{ background: "#fff4e0", color: "#a14f06" }}>Inspecting</span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Rahima K. · Galaxy A55 · within warranty</div>
                      <div style={{ flexGrow: "1", borderRadius: "var(--radius-lg)", background: "#f8fafc" }} />
                      <span className="btn solid sm" style={{ alignSelf: "flex-end" }}>Move to: Sent to brand</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> work through a queue one by one.</span>
                  <code className="kcode">selected row: 3px left bar</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>H · Board (kanban)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f4f9", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#0a5bd0" }} />Received<span className="pcnt" style={{ marginLeft: "auto" }}>1</span></div>
                      <div style={{ padding: "10px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>WC-0312</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Charging port</div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f4f9", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#f59e0b" }} />Inspecting<span className="pcnt" style={{ marginLeft: "auto" }}>1</span></div>
                      <div style={{ padding: "10px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>WC-0318</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Screen flickers</div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f4f9", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#7c3aed" }} />At brand<span className="pcnt" style={{ marginLeft: "auto" }}>2</span></div>
                      <div style={{ padding: "10px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>WC-0317</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Battery drain</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>WC-0316</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Speaker</div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#f1f4f9", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Ready<span className="pcnt" style={{ marginLeft: "auto" }}>1</span></div>
                      <div style={{ padding: "10px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>WC-0314</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>No sound</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> things that move through stages.</span>
                  <code className="kcode">column bg #f1f4f9</code>
                  {" "}
                  <code className="kcode">drag card</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>I · Card grid</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                    <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", overflow: "hidden", background: "#fff" }}>
                      <div style={{ position: "relative", height: "110px", background: "linear-gradient(160deg,#b45309,#0f172a)" }}>
                        <span style={{ position: "absolute", top: "8px", left: "8px", height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Best seller</span>
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Sunscreen SPF50</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", marginTop: "4px" }}>
                          <b className="tn">৳580</b>
                          <span style={{ color: "var(--text-muted)" }}>84 in stock</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", overflow: "hidden", background: "#fff" }}>
                      <div style={{ position: "relative", height: "110px", background: "linear-gradient(160deg,#1d4ed8,#0f172a)" }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Galaxy A55 5G</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", marginTop: "4px" }}>
                          <b className="tn">৳44,000</b>
                          <span style={{ color: "var(--text-muted)" }}>12 in stock</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", overflow: "hidden", background: "#fff" }}>
                      <div style={{ position: "relative", height: "110px", background: "linear-gradient(160deg,#15803d,#0f172a)" }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Mango Pickle 400g</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", marginTop: "4px" }}>
                          <b className="tn">৳350</b>
                          <span style={{ color: "var(--text-muted)" }}>86 in stock</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0", overflow: "hidden", background: "#fff" }}>
                      <div style={{ position: "relative", height: "110px", background: "linear-gradient(160deg,#be185d,#0f172a)" }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Cotton kurti</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", marginTop: "4px" }}>
                          <b className="tn">৳980</b>
                          <span style={{ color: "#be123c" }}>Low · 4 left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> products, media, templates — when the picture matters.</span>
                  <code className="kcode">4 cols at 1440</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>J · Timeline</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <span style={{ position: "absolute", left: "6px", top: "6px", bottom: "6px", width: "2px", background: "#eef1f6" }} />
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-20px", top: "4px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#10b981", boxShadow: "0 0 0 3px #fff" }} />
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Delivered</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Pathao · 18 Sep, 4:12 PM</div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-20px", top: "4px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#0a5bd0", boxShadow: "0 0 0 3px #fff" }} />
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Out for delivery</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Rider Jahid · 18 Sep, 11:02 AM</div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-20px", top: "4px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#7c3aed", boxShadow: "0 0 0 3px #fff" }} />
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Packed</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Central Warehouse · 17 Sep</div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-20px", top: "4px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#f59e0b", boxShadow: "0 0 0 3px #fff" }} />
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Confirmed by phone</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lamia · 16 Sep, 3:40 PM</div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-20px", top: "4px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#94a3b8", boxShadow: "0 0 0 3px #fff" }} />
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Order placed</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Website · COD · 16 Sep</div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> order history, activity log, audit.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>K · Tree table</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="r">Products</th>
                        <th className="r">Stock value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "0px", fontWeight: "var(--weight-semibold)" }}><span style={{ color: "var(--text-muted)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>Skin care</div>
                        </td>
                        <td className="r tn">64</td>
                        <td className="r tn">৳4,12,000</td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "20px", fontWeight: "var(--weight-medium)" }}><span style={{ color: "var(--text-muted)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>Sunscreen</div>
                        </td>
                        <td className="r tn">12</td>
                        <td className="r tn">৳96,400</td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "20px", fontWeight: "var(--weight-medium)" }}><span style={{ color: "var(--text-muted)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>Toner</div>
                        </td>
                        <td className="r tn">9</td>
                        <td className="r tn">৳61,200</td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "0px", fontWeight: "var(--weight-semibold)" }}><span style={{ color: "var(--text-muted)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>Grocery</div>
                        </td>
                        <td className="r tn">89</td>
                        <td className="r tn">৳2,30,500</td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "20px", fontWeight: "var(--weight-medium)" }}><span style={{ color: "var(--text-muted)" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>Pickles</div>
                        </td>
                        <td className="r tn">14</td>
                        <td className="r tn">৳44,800</td>
                      </tr>
                      <tr className="row">
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "40px", fontWeight: "var(--weight-medium)" }}><span style={{ width: "14px" }} />Mango pickle</div>
                        </td>
                        <td className="r tn">3</td>
                        <td className="r tn">৳18,200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> categories, chart of accounts, locations.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>L · Table states</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: "1", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                      <span className="klbl">Loading</span>
                      <div className="sk" style={{ height: "14px", width: "60%" }} />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div className="sk" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)" }} />
                        <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div className="sk" style={{ height: "10px" }} />
                          <div className="sk" style={{ height: "10px", width: "50%" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div className="sk" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)" }} />
                        <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div className="sk" style={{ height: "10px" }} />
                          <div className="sk" style={{ height: "10px", width: "50%" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div className="sk" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)" }} />
                        <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div className="sk" style={{ height: "10px" }} />
                          <div className="sk" style={{ height: "10px", width: "50%" }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: "1", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                      <span className="klbl">Empty · first time</span>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center" }}>
                        <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="M10 9H8" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                          </svg>
                        </span>
                        <b>No purchase orders yet</b>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Make one to start buying stock.</span>
                        <span className="btn solid sm">New purchase order</span>
                      </div>
                    </div>
                    <div style={{ flex: "1", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                      <span className="klbl">No results</span>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center" }}>
                        <span style={{ color: "var(--text-muted)" }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </span>
                        <b>Nothing matches “niacinamide”</b>
                        <span className="btn line sm">Clear filters</span>
                      </div>
                    </div>
                    <div style={{ flex: "1", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                      <span className="klbl">Error</span>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center" }}>
                        <span style={{ color: "#be123c" }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </svg>
                        </span>
                        <b>Couldn’t load orders</b>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Check the internet and try again.</span>
                        <span className="btn line sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
  <path d="M8 16H3v5" />
</svg>Try again</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.sk skeleton 1.4s</code>
                  {" "}
                  <code className="kcode">empty = one action</code>
                  {" "}
                  <code className="kcode">errors say what to do</code>
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
