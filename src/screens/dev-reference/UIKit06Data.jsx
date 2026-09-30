'use client';
// Generated from design/templates/dev-reference/UIKit06Data.dc.html by scripts/convert-design.mjs.
// UI kit 06 · KPI tiles & charts — UI kit — Data display & charts.
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

export default class UIKit06DataScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit06Data">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3200px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 06 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>{"Data display & charts"}</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Number tiles in four styles and every chart the backend uses: trend, bars, bar list, stacked, donut, funnel, dumbbell, heatmap, progress, leaderboard and key–value lists.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s61">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">6.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Number tiles</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Four tile styles. One headline number, a label, and at most one comparison.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A · Icon tile</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Lists</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>1,284</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Products in stock</div>
                      </div>
                    </div>
                    <div className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                      </span>
                      <div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>7</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Low stock</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">kpi(label, value, sub, colour, icon)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>B · Dark tile with trend</span>
                  <span className="ktag" style={{ background: "#0b1733", color: "#fff" }}>Analytics</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#0b1733", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="ht">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#60a5fa" }} />
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Delivered revenue</span>
                      </div>
                      <div className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>৳10,16,000</div>
                      <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 14%</span>
                      <svg width="140" height="28" viewBox="0 0 140 28" aria-hidden="true">
                        <path d="M0.0 15.6 C1.8 17.1 7.2 22.9 10.8 24.4 C14.4 26.0 17.9 26.6 21.5 25.0 C25.1 23.4 28.7 16.5 32.3 14.9 C35.9 13.3 39.5 15.3 43.1 15.5 C46.7 15.8 50.3 15.6 53.8 16.4 C57.4 17.3 61.0 22.4 64.6 20.6 C68.2 18.8 71.8 7.5 75.4 5.8 C79.0 4.2 82.6 9.3 86.2 10.8 C89.7 12.3 93.3 15.1 96.9 14.6 C100.5 14.2 104.1 9.8 107.7 8.0 C111.3 6.2 114.9 4.8 118.5 4.0 C122.1 3.1 125.6 1.7 129.2 3.0 C132.8 4.3 138.2 10.5 140.0 12.1 L140 28 L0 28 Z" fill="#60a5fa" fillOpacity=".14" />
                        <path d="M0.0 15.6 C1.8 17.1 7.2 22.9 10.8 24.4 C14.4 26.0 17.9 26.6 21.5 25.0 C25.1 23.4 28.7 16.5 32.3 14.9 C35.9 13.3 39.5 15.3 43.1 15.5 C46.7 15.8 50.3 15.6 53.8 16.4 C57.4 17.3 61.0 22.4 64.6 20.6 C68.2 18.8 71.8 7.5 75.4 5.8 C79.0 4.2 82.6 9.3 86.2 10.8 C89.7 12.3 93.3 15.1 96.9 14.6 C100.5 14.2 104.1 9.8 107.7 8.0 C111.3 6.2 114.9 4.8 118.5 4.0 C122.1 3.1 125.6 1.7 129.2 3.0 C132.8 4.3 138.2 10.5 140.0 12.1" fill="none" stroke="#60a5fa" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <div className="ht">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#34d399" }} />
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Real return</span>
                      </div>
                      <div className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>4.95×</div>
                      <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 9%</span>
                      <svg width="140" height="28" viewBox="0 0 140 28" aria-hidden="true">
                        <path d="M0.0 22.7 C1.8 22.0 7.2 18.2 10.8 18.3 C14.4 18.4 17.9 22.2 21.5 23.3 C25.1 24.4 28.7 27.1 32.3 25.0 C35.9 22.9 39.5 11.9 43.1 10.6 C46.7 9.4 50.3 16.4 53.8 17.5 C57.4 18.7 61.0 17.8 64.6 17.5 C68.2 17.2 71.8 17.7 75.4 15.9 C79.0 14.1 82.6 7.8 86.2 6.8 C89.7 5.9 93.3 8.5 96.9 10.1 C100.5 11.7 104.1 17.6 107.7 16.5 C111.3 15.3 114.9 4.9 118.5 3.0 C122.1 1.1 125.6 4.5 129.2 4.8 C132.8 5.2 138.2 5.2 140.0 5.3 L140 28 L0 28 Z" fill="#34d399" fillOpacity=".14" />
                        <path d="M0.0 22.7 C1.8 22.0 7.2 18.2 10.8 18.3 C14.4 18.4 17.9 22.2 21.5 23.3 C25.1 24.4 28.7 27.1 32.3 25.0 C35.9 22.9 39.5 11.9 43.1 10.6 C46.7 9.4 50.3 16.4 53.8 17.5 C57.4 18.7 61.0 17.8 64.6 17.5 C68.2 17.2 71.8 17.7 75.4 15.9 C79.0 14.1 82.6 7.8 86.2 6.8 C89.7 5.9 93.3 8.5 96.9 10.1 C100.5 11.7 104.1 17.6 107.7 16.5 C111.3 15.3 114.9 4.9 118.5 3.0 C122.1 1.1 125.6 4.5 129.2 4.8 C132.8 5.2 138.2 5.2 140.0 5.3" fill="none" stroke="#34d399" strokeWidth="1.8" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.hero .ht</code>
                  {" "}
                  <code className="kcode">sparkline 14 days</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>C · Delta tile</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="ey">Orders today</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>61</span>
                        <span className="dl" style={{ background: "#e7f8f1", color: "#047857" }}>▲ 12%</span>
                      </div>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>vs last Saturday</span>
                    </div>
                    <div className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="ey">Return rate</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>9.5%</span>
                        <span className="dl" style={{ background: "#ffece6", color: "#be123c" }}>▲ 1.2 pts</span>
                      </div>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>watch Sylhet</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.tc</code>
                  {" "}
                  <code className="kcode">.dl</code>
                  {" "}
                  <code className="kcode">▲ good = green</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>D · Ring tile</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="tc" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ position: "relative", width: "80px", height: "80px" }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#eef1f6" strokeWidth="8" />
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray="205.1 213.6" />
                        </svg>
                        <span className="tn" style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)" }}>96%</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: "var(--weight-semibold)" }}>On time</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>attendance this month</div>
                      </div>
                    </div>
                    <div className="tc" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ position: "relative", width: "80px", height: "80px" }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#eef1f6" strokeWidth="8" />
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" strokeDasharray="153.8 213.6" />
                        </svg>
                        <span className="tn" style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)" }}>72%</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: "var(--weight-semibold)" }}>Space used</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Central Warehouse</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">ring r=34 stroke 8</code>
                  {" "}
                  <code className="kcode">dasharray = C × pct</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s62">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">6.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Charts</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Charts are inline SVG built from data — no chart library needed. Numbers use tabular figures. Every chart has a legend or labels, never colour alone.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Line + area + bars</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Trend</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <svg width="100%" height="220" viewBox="0 0 640 210" preserveAspectRatio="none" aria-label="Revenue chart">
                    <defs>
                      <linearGradient id="kg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2563eb" stopOpacity=".28" />
                        <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" x2="640" y1="8" y2="8" stroke="#eef1f6" />
                    <line x1="0" x2="640" y1="72" y2="72" stroke="#eef1f6" />
                    <line x1="0" x2="640" y1="136" y2="136" stroke="#eef1f6" />
                    <line x1="0" x2="640" y1="200" y2="200" stroke="#eef1f6" />
                    <path d="M-6.0 200 v-18.0 h12.0 v18.0 Z M16.1 200 v-20.8 h12.0 v20.8 Z M38.1 200 v-21.6 h12.0 v21.6 Z M60.2 200 v-23.2 h12.0 v23.2 Z M82.3 200 v-18.4 h12.0 v18.4 Z M104.3 200 v-21.2 h12.0 v21.2 Z M126.4 200 v-24.4 h12.0 v24.4 Z M148.5 200 v-20.5 h12.0 v20.5 Z M170.6 200 v-21.0 h12.0 v21.0 Z M192.6 200 v-21.5 h12.0 v21.5 Z M214.7 200 v-25.4 h12.0 v25.4 Z M236.8 200 v-20.3 h12.0 v20.3 Z M258.8 200 v-21.0 h12.0 v21.0 Z M280.9 200 v-24.9 h12.0 v24.9 Z M303.0 200 v-23.1 h12.0 v23.1 Z M325.0 200 v-22.2 h12.0 v22.2 Z M347.1 200 v-21.1 h12.0 v21.1 Z M369.2 200 v-26.7 h12.0 v26.7 Z M391.2 200 v-22.8 h12.0 v22.8 Z M413.3 200 v-21.5 h12.0 v21.5 Z M435.4 200 v-24.6 h12.0 v24.6 Z M457.4 200 v-25.1 h12.0 v25.1 Z M479.5 200 v-24.3 h12.0 v24.3 Z M501.6 200 v-20.9 h12.0 v20.9 Z M523.7 200 v-27.1 h12.0 v27.1 Z M545.7 200 v-25.2 h12.0 v25.2 Z M567.8 200 v-23.0 h12.0 v23.0 Z M589.9 200 v-24.2 h12.0 v24.2 Z M611.9 200 v-26.3 h12.0 v26.3 Z M634.0 200 v-26.8 h12.0 v26.8 Z" fill="#f59e0b" fillOpacity=".75" />
                    <path d="M0.0 90.8 C3.7 95.2 14.7 119.5 22.1 117.2 C29.4 115.0 36.8 83.3 44.1 77.5 C51.5 71.7 58.9 78.9 66.2 82.6 C73.6 86.2 80.9 97.6 88.3 99.3 C95.6 101.0 103.0 96.3 110.3 93.0 C117.7 89.6 125.1 83.2 132.4 79.1 C139.8 75.1 147.1 64.3 154.5 68.7 C161.8 73.2 169.2 104.7 176.6 105.7 C183.9 106.8 191.3 81.2 198.6 74.9 C206.0 68.6 213.3 67.3 220.7 67.7 C228.0 68.2 235.4 74.5 242.8 77.6 C250.1 80.8 257.5 87.2 264.8 86.6 C272.2 86.1 279.5 80.5 286.9 74.3 C294.3 68.1 301.6 47.1 309.0 49.3 C316.3 51.6 323.7 84.2 331.0 87.9 C338.4 91.5 345.7 76.1 353.1 71.4 C360.5 66.6 367.8 62.1 375.2 59.5 C382.5 56.8 389.9 52.8 397.2 55.2 C404.6 57.6 412.0 71.2 419.3 74.0 C426.7 76.8 434.0 78.2 441.4 71.9 C448.7 65.5 456.1 36.7 463.4 35.7 C470.8 34.8 478.2 61.6 485.5 66.2 C492.9 70.7 500.2 64.7 507.6 63.1 C514.9 61.4 522.3 60.7 529.7 56.2 C537.0 51.8 544.4 36.4 551.7 36.3 C559.1 36.2 566.4 50.2 573.8 55.4 C581.1 60.5 588.5 71.9 595.9 67.4 C603.2 63.0 610.6 32.4 617.9 28.6 C625.3 24.8 636.3 42.0 640.0 44.7 L640 200 L0 200 Z" fill="url(#kg1)" />
                    <path d="M0.0 90.8 C3.7 95.2 14.7 119.5 22.1 117.2 C29.4 115.0 36.8 83.3 44.1 77.5 C51.5 71.7 58.9 78.9 66.2 82.6 C73.6 86.2 80.9 97.6 88.3 99.3 C95.6 101.0 103.0 96.3 110.3 93.0 C117.7 89.6 125.1 83.2 132.4 79.1 C139.8 75.1 147.1 64.3 154.5 68.7 C161.8 73.2 169.2 104.7 176.6 105.7 C183.9 106.8 191.3 81.2 198.6 74.9 C206.0 68.6 213.3 67.3 220.7 67.7 C228.0 68.2 235.4 74.5 242.8 77.6 C250.1 80.8 257.5 87.2 264.8 86.6 C272.2 86.1 279.5 80.5 286.9 74.3 C294.3 68.1 301.6 47.1 309.0 49.3 C316.3 51.6 323.7 84.2 331.0 87.9 C338.4 91.5 345.7 76.1 353.1 71.4 C360.5 66.6 367.8 62.1 375.2 59.5 C382.5 56.8 389.9 52.8 397.2 55.2 C404.6 57.6 412.0 71.2 419.3 74.0 C426.7 76.8 434.0 78.2 441.4 71.9 C448.7 65.5 456.1 36.7 463.4 35.7 C470.8 34.8 478.2 61.6 485.5 66.2 C492.9 70.7 500.2 64.7 507.6 63.1 C514.9 61.4 522.3 60.7 529.7 56.2 C537.0 51.8 544.4 36.4 551.7 36.3 C559.1 36.2 566.4 50.2 573.8 55.4 C581.1 60.5 588.5 71.9 595.9 67.4 C603.2 63.0 610.6 32.4 617.9 28.6 C625.3 24.8 636.3 42.0 640.0 44.7" fill="none" stroke="#2563eb" strokeWidth="2.2" />
                    <path d="M0.0 77.7 C3.7 83.3 14.7 109.9 22.1 111.2 C29.4 112.5 36.8 90.8 44.1 85.6 C51.5 80.4 58.9 79.3 66.2 80.1 C73.6 80.9 80.9 87.2 88.3 90.4 C95.6 93.5 103.0 99.0 110.3 98.9 C117.7 98.8 125.1 94.7 132.4 89.7 C139.8 84.6 147.1 66.4 154.5 68.7 C161.8 71.0 169.2 99.9 176.6 103.6 C183.9 107.2 191.3 94.3 198.6 90.5 C206.0 86.7 213.3 82.7 220.7 80.8 C228.0 78.8 235.4 76.2 242.8 78.7 C250.1 81.2 257.5 93.0 264.8 95.7 C272.2 98.5 279.5 100.7 286.9 95.5 C294.3 90.3 301.6 65.2 309.0 64.7 C316.3 64.2 323.7 88.1 331.0 92.6 C338.4 97.0 345.7 92.2 353.1 91.1 C360.5 90.0 367.8 89.4 375.2 85.9 C382.5 82.4 389.9 69.9 397.2 70.1 C404.6 70.4 412.0 82.5 419.3 87.4 C426.7 92.3 434.0 103.1 441.4 99.6 C448.7 96.1 456.1 69.4 463.4 66.4 C470.8 63.4 478.2 78.4 485.5 81.7 C492.9 85.0 500.2 84.4 507.6 86.1 C514.9 87.9 522.3 95.5 529.7 92.3 C537.0 89.1 544.4 69.6 551.7 66.9 C559.1 64.3 566.4 71.1 573.8 76.4 C581.1 81.8 588.5 99.7 595.9 98.9 C603.2 98.2 610.6 76.0 617.9 71.9 C625.3 67.9 636.3 74.2 640.0 74.6" fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="4 4" />
                  </svg>
                  <div style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span>━ Revenue</span>
                    <span style={{ color: "#b45309" }}>▮ Spend</span>
                    <span style={{ color: "var(--text-muted)" }}>┅ Previous</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> money over time.</span>
                  <code className="kcode">curve() catmull-rom</code>
                  {" "}
                  <code className="kcode">area fill 28%→0</code>
                  {" "}
                  <code className="kcode">previous = dashed grey</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Vertical bars</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "180px" }}>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>62</span>
                      <div style={{ width: "100%", height: "62%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sat</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>48</span>
                      <div style={{ width: "100%", height: "48%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sun</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>55</span>
                      <div style={{ width: "100%", height: "55%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Mon</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>71</span>
                      <div style={{ width: "100%", height: "71%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Tue</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>66</span>
                      <div style={{ width: "100%", height: "66%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Wed</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>80</span>
                      <div style={{ width: "100%", height: "80%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#0a5bd0" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Thu</span>
                    </div>
                    <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>34</span>
                      <div style={{ width: "100%", height: "34%", borderRadius: "var(--radius-lg) var(--radius-lg) 3px 3px", background: "#bfdbfe" }} />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Fri</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> comparing days, branches, staff.</span>
                  <code className="kcode">highlight the one that matters</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Horizontal bar list</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "5px" }}>
                        <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)" }}>Facebook / Instagram</span>
                        <span className="tn" style={{ color: "var(--text-muted)" }}>24,800</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "var(--radius-full)", background: "#2563eb" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "5px" }}>
                        <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)" }}>TikTok</span>
                        <span className="tn" style={{ color: "var(--text-muted)" }}>11,200</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                        <div style={{ width: "45%", height: "100%", borderRadius: "var(--radius-full)", background: "#2563eb" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "5px" }}>
                        <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)" }}>Google</span>
                        <span className="tn" style={{ color: "var(--text-muted)" }}>9,300</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                        <div style={{ width: "38%", height: "100%", borderRadius: "var(--radius-full)", background: "#2563eb" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "5px" }}>
                        <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)" }}>Organic</span>
                        <span className="tn" style={{ color: "var(--text-muted)" }}>8,600</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                        <div style={{ width: "35%", height: "100%", borderRadius: "var(--radius-full)", background: "#2563eb" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> ranked categories with labels.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Stacked bar (100%)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", height: "34px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                    <div style={{ width: "18%", background: "var(--fill-warning)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>৳18</div>
                    <div style={{ width: "7%", background: "#64748b", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div style={{ width: "1%", background: "#e11d48", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div style={{ width: "2%", background: "#94a3b8", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div style={{ width: "72%", background: "var(--fill-success)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>৳72 left</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "var(--text-xs)" }}>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#f59e0b" }} />Ads</span>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#64748b" }} />Courier</span>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#e11d48" }} />Returns</span>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#94a3b8" }} />Packing</span>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981" }} />Left for you</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> parts of one whole.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Donut</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ position: "relative", width: "150px", height: "150px" }}>
                      <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#eef1f6" strokeWidth="16" />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="241.2 364.4" strokeDashoffset="0.0" />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#059669" strokeWidth="16" strokeDasharray="73.5 364.4" strokeDashoffset="-244.2" />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#db2777" strokeWidth="16" strokeDasharray="40.7 364.4" strokeDashoffset="-320.7" />
                      </svg>
                      <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span className="ey" style={{ fontSize: "var(--text-2xs)" }}>Spend</span>
                        <span className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>৳1.85L</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ display: "flex", gap: "8px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#2563eb" }} />Meta <b className="tn">67%</b></span>
                      <span style={{ display: "flex", gap: "8px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#059669" }} />Google <b className="tn">21%</b></span>
                      <span style={{ display: "flex", gap: "8px", alignItems: "center" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#db2777" }} />TikTok <b className="tn">12%</b></span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> 3–5 parts. More than 5 → bar list.</span>
                  <code className="kcode">gap 3px between segments</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Funnel</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <svg width="100%" height="160" viewBox="0 0 600 160" preserveAspectRatio="none" aria-label="Funnel">
                    <defs>
                      <linearGradient id="kg2" x1="0" x2="1">
                        <stop offset="0" stopColor="#1e3a8a" />
                        <stop offset="1" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <path d="M0.0 0.0 L100.0 0.0 L100.0 26.3 L200.0 26.3 L200.0 56.3 L300.0 56.3 L300.0 63.3 L400.0 63.3 L400.0 67.9 L500.0 67.9 L500.0 69.8 L600.0 69.8 L600.0 90.2 L500.0 90.2 L500.0 92.1 L400.0 92.1 L400.0 96.7 L300.0 96.7 L300.0 103.7 L200.0 103.7 L200.0 133.7 L100.0 133.7 L100.0 160.0 L0.0 160.0 Z" fill="url(#kg2)" />
                    <line x1="100" x2="100" y1="0" y2="160" stroke="#fff" strokeWidth="2" />
                    <line x1="200" x2="200" y1="0" y2="160" stroke="#fff" strokeWidth="2" />
                    <line x1="300" x2="300" y1="0" y2="160" stroke="#fff" strokeWidth="2" />
                    <line x1="400" x2="400" y1="0" y2="160" stroke="#fff" strokeWidth="2" />
                    <line x1="500" x2="500" y1="0" y2="160" stroke="#fff" strokeWidth="2" />
                  </svg>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", fontSize: "var(--text-xs)" }}>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>62,400</b>
                      <div style={{ color: "var(--text-muted)" }}>Sessions</div>
                    </div>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>28,100</b>
                      <div style={{ color: "var(--text-muted)" }}>Viewed</div>
                    </div>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>5,480</b>
                      <div style={{ color: "var(--text-muted)" }}>Cart</div>
                    </div>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>2,710</b>
                      <div style={{ color: "var(--text-muted)" }}>Checkout</div>
                    </div>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>1,420</b>
                      <div style={{ color: "var(--text-muted)" }}>Ordered</div>
                    </div>
                    <div>
                      <b className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>1,012</b>
                      <div style={{ color: "var(--text-muted)" }}>Delivered</div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> steps that lose people.</span>
                  <code className="kcode">height = √value (readable tails)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Heatmap / register</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "110px repeat(21, 1fr)", gap: "3px", fontSize: "var(--text-xs)" }}>
                    <span />
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>M</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>W</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>F</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>M</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>W</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>F</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>S</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>M</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>W</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>T</span>
                    <span style={{ textAlign: "center", color: "var(--text-muted)" }}>F</span>
                    <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>Sadia Akter</span>
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>Rafi Ahmed</span>
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>Nabila Rahman</span>
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>Tareq Aziz</span>
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#bbf7d0" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fde68a" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fecaca" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#e7f8f1" }} />
                    <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> attendance, sales by hour, stock by bin.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Dumbbell (claim vs real)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "60px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>Meta</span>
                      <div style={{ position: "relative", flexGrow: "1", height: "20px" }}>
                        <div style={{ position: "absolute", left: "0", right: "0", top: "9px", height: "2px", background: "#eef1f6" }} />
                        <div style={{ position: "absolute", left: "67%", width: "27%", top: "8px", height: "4px", background: "linear-gradient(90deg,#2563eb,#cbd5e1)" }} />
                        <span style={{ position: "absolute", left: "67%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#2563eb", boxShadow: "0 0 0 3px #fff" }} />
                        <span style={{ position: "absolute", left: "94%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#fff", border: "2px solid #94a3b8" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "60px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>Google</span>
                      <div style={{ position: "relative", flexGrow: "1", height: "20px" }}>
                        <div style={{ position: "absolute", left: "0", right: "0", top: "9px", height: "2px", background: "#eef1f6" }} />
                        <div style={{ position: "absolute", left: "25%", width: "6%", top: "8px", height: "4px", background: "linear-gradient(90deg,#059669,#cbd5e1)" }} />
                        <span style={{ position: "absolute", left: "25%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#059669", boxShadow: "0 0 0 3px #fff" }} />
                        <span style={{ position: "absolute", left: "31%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#fff", border: "2px solid #94a3b8" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "60px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>TikTok</span>
                      <div style={{ position: "relative", flexGrow: "1", height: "20px" }}>
                        <div style={{ position: "absolute", left: "0", right: "0", top: "9px", height: "2px", background: "#eef1f6" }} />
                        <div style={{ position: "absolute", left: "10%", width: "9%", top: "8px", height: "4px", background: "linear-gradient(90deg,#db2777,#cbd5e1)" }} />
                        <span style={{ position: "absolute", left: "10%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#db2777", boxShadow: "0 0 0 3px #fff" }} />
                        <span style={{ position: "absolute", left: "19%", top: "2px", width: "16px", height: "16px", marginLeft: "-8px", borderRadius: "var(--radius-full)", background: "#fff", border: "2px solid #94a3b8" }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> two numbers that should match but don’t.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Progress & meters"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "6px" }}>
                        <span style={{ flexGrow: "1" }}>Scanned</span>
                        <b className="tn">14 of 20</b>
                      </div>
                      <div style={{ height: "10px", borderRadius: "var(--radius-full)", background: "#eef1f6", overflow: "hidden" }}>
                        <div style={{ width: "70%", height: "100%", background: "#10b981", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "6px" }}>
                        <span style={{ flexGrow: "1" }}>Budget used</span>
                        <b className="tn">82%</b>
                      </div>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6", overflow: "hidden" }}>
                        <div style={{ width: "82%", height: "100%", background: "#f59e0b", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", fontSize: "var(--text-xs-plus)", marginBottom: "6px" }}>
                        <span style={{ flexGrow: "1" }}>Loan paid back</span>
                        <b className="tn">৳40,000 of ৳60,000</b>
                      </div>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6", overflow: "hidden" }}>
                        <div style={{ width: "67%", height: "100%", background: "#2563eb", borderRadius: "var(--radius-full)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span style={{ flex: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <span style={{ flex: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <span style={{ flex: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <span style={{ flex: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#e2e8f0" }} />
                      <span style={{ flex: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#e2e8f0" }} />
                    </div>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Segmented: profile 3 of 5 done</span>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Leaderboard</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#fff8e6" }}>
                      <span className="tn" style={{ width: "20px", fontWeight: "var(--weight-semibold)", color: "#b45309" }}>1</span>
                      <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>SA</span>
                      <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>Sadia Akter</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳1,42,300</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span className="tn" style={{ width: "20px", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>2</span>
                      <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>RA</span>
                      <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>Rafi Ahmed</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳98,400</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span className="tn" style={{ width: "20px", fontWeight: "var(--weight-semibold)", color: "#9a3412" }}>3</span>
                      <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>MD</span>
                      <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>Moumita Das</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳86,100</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "#fff" }}>
                      <span className="tn" style={{ width: "20px", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>4</span>
                      <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#075985", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>AR</span>
                      <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>Arif Rahman</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳61,900</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> staff sales, top products.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Key–value list</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #eef1f6", fontSize: "var(--text-sm)" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Order</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>GC-24817</span>
                    </div>
                    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #eef1f6", fontSize: "var(--text-sm)" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Placed</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>16 Sep 2026, 2:14 PM</span>
                    </div>
                    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #eef1f6", fontSize: "var(--text-sm)" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Payment</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Cash on delivery</span>
                    </div>
                    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #eef1f6", fontSize: "var(--text-sm)" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Courier</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Pathao · PTH-88120</span>
                    </div>
                    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #eef1f6", fontSize: "var(--text-sm)" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Total</span>
                      <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>৳1,290</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> record details and summaries.</span>
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
