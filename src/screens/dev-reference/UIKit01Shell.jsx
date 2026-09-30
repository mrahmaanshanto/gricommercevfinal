'use client';
// Generated from design/templates/dev-reference/UIKit01Shell.dc.html by scripts/convert-design.mjs.
// UI kit 01 · Shell & navigation — UI kit — Shell & navigation.
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

export default class UIKit01ShellScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit01Shell">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "4400px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 01 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>{"Shell & navigation"}</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>The frame every backend screen sits in: sidebar, headers, page headers, tabs, filters, breadcrumbs, pagination, steps and search.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s11">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>App shell</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Every backend page uses the same frame: 12 px outer inset, 272 px sidebar, 76 px header, 28 px content padding and 24 px gap between blocks.</p>
              </div>
            </div>
            <div className="kspec" style={{ gridColumn: "span 1" }}>
              <div className="kspec-h">
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Anatomy</span>
              </div>
              <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                <div style={{ display: "flex", gap: "10px", height: "300px", padding: "10px", borderRadius: "var(--radius-xl)", background: "#eef2f7", position: "relative" }}>
                  <div style={{ width: "170px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1.5px dashed #0a5bd0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#0a5bd0", fontWeight: "var(--weight-semibold)" }}>{"<gc-sidebar>"}<span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>272 px · sticky</span></div>
                  <div style={{ flexGrow: "1", borderRadius: "var(--radius-xl)", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ height: "54px", background: "#fff", borderBottom: "1.5px dashed #db2777", display: "flex", alignItems: "center", justifyContent: "center", color: "#db2777", fontWeight: "var(--weight-semibold)" }}>Header · 76 px · crumb + title + search + bell + avatar</div>
                    <div style={{ flexGrow: "1", margin: "18px", border: "1.5px dashed #059669", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "10px", padding: "12px", color: "var(--text-success)", fontWeight: "var(--weight-semibold)" }}>
                      <span>Content · padding 28 · gap 24</span>
                      <div style={{ height: "30px", borderRadius: "var(--radius-lg)", background: "rgba(5,150,105,.12)" }} />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: "1", height: "60px", borderRadius: "var(--radius-lg)", background: "rgba(5,150,105,.12)" }} />
                        <div style={{ flex: "1", height: "60px", borderRadius: "var(--radius-lg)", background: "rgba(5,150,105,.12)" }} />
                        <div style={{ flex: "1", height: "60px", borderRadius: "var(--radius-lg)", background: "rgba(5,150,105,.12)" }} />
                      </div>
                      <div style={{ flexGrow: "1", borderRadius: "var(--radius-lg)", background: "rgba(5,150,105,.12)" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec-f">
                <code className="kcode">{"<gc-sidebar sticky active=\"id\" base=\"../\">"}</code>
                {" "}
                <code className="kcode">main: bg #f8fafc · radius 16</code>
                {" "}
                <code className="kcode">outer: bg #eef2f7 · padding 12</code>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Sidebar · expanded</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Default</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "240px", height: "420px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flexShrink: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 8px 12px" }}>
                        <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="" style={{ height: "22px" }} />
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)", padding: "12px 10px 4px", textTransform: "uppercase" }}>General</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Dashboard</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Orders</span>
                        <span style={{ minWidth: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "0 7px" }}>18</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Products</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Customers</span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)", padding: "12px 10px 4px", textTransform: "uppercase" }}>{"Stocks & Inventory"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Stock list</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 3 4 7l4 4" />
                          <path d="M4 7h16" />
                          <path d="m16 21 4-4-4-4" />
                          <path d="M20 17H4" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Transfers</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>{"Expiry & disposal"}</span>
                        <span style={{ minWidth: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "0 7px" }}>6</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> default for all desktop pages.</span>
                  <code className="kcode">.gc-navitem</code>
                  {" "}
                  <code className="kcode">.gc-navitem--active</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Sidebar · collapsed rail</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "76px", height: "420px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", padding: "14px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: "0" }}>
                      <img src="/assets/8c3babaf605936b39809e7960e7c846f.png" alt="" style={{ width: "32px", height: "32px", marginBottom: "10px" }} />
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 3 4 7l4 4" />
                          <path d="M4 7h16" />
                          <path d="m16 21 4-4-4-4" />
                          <path d="M20 17H4" />
                        </svg>
                      </span>
                      <span style={{ width: "44px", height: "40px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 3v18h18" />
                          <path d="M18 17V9" />
                          <path d="M13 17V5" />
                          <path d="M8 17v-3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> POS and full-width editors.</span>
                  <code className="kcode">collapsed attribute</code>
                  {" "}
                  <code className="kcode">76 px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Sidebar · drill-in</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "240px", height: "420px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flexShrink: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 8px 12px" }}>
                        <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="" style={{ height: "22px" }} />
                      </div>
                      <div style={{ padding: "0 6px 6px" }}>
                        <span className="btn solid sm" style={{ height: "32px", borderRadius: "var(--radius-full)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m15 18-6-6 6-6" />
</svg>Back</span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)", padding: "12px 10px 4px", textTransform: "uppercase" }}>Products</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>All products</span>
                        <span style={{ minWidth: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.7)", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#003087", padding: "0 7px" }}>412</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Add product</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Categories</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 4h-7" />
                          <path d="M10 4H3" />
                          <path d="M21 12h-9" />
                          <path d="M8 12H3" />
                          <path d="M21 20h-5" />
                          <path d="M12 20H3" />
                          <path d="M14 2v4" />
                          <path d="M8 10v4" />
                          <path d="M16 18v4" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Catalog setup</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Inventory</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "38px", padding: "0 10px", borderRadius: "var(--radius-xl)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#475569" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>Low stock</span>
                        <span style={{ minWidth: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#f1f5f9", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "0 7px" }}>7</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> a module with more than 5 sub-pages.</span>
                  <code className="kcode">children: [...]</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s12">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Top header</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Four header styles. Keep the title short; the crumb names the module.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A · Standard</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Default</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "76px", display: "flex", alignItems: "center", gap: "14px", padding: "0 22px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Purchase</div>
                      <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Purchase orders</div>
                    </div>
                    <div style={{ position: "relative", width: "300px" }}>
                      <span style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </span>
                      <input className="inp" placeholder="Search or scan any barcode" aria-label="Search" style={{ paddingLeft: "40px", paddingRight: "48px", background: "#f8fafc", height: "42px" }} />
                      <span style={{ position: "absolute", right: "5px", top: "5px", width: "32px", height: "32px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                          <path d="M8 7v10" />
                          <path d="M12 7v10" />
                          <path d="M17 7v10" />
                        </svg>
                      </span>
                    </div>
                    <span className="ib">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                    </span>
                    <span style={{ width: "38px", height: "38px", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>MR</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> every list page.</span>
                  <code className="kcode">header</code>
                  {" "}
                  <code className="kcode">height 76</code>
                  {" "}
                  <code className="kcode">.ib</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>B · With back button</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "76px", display: "flex", alignItems: "center", gap: "14px", padding: "0 22px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                    <span className="ib">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Purchase orders</div>
                      <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>PO-2609-0020</div>
                    </div>
                    <span className="btn line sm">Print</span>
                    <span className="btn solid sm">Save</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> detail and edit pages.</span>
                  <code className="kcode">back=href</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>C · With page actions</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "76px", display: "flex", alignItems: "center", gap: "14px", padding: "0 22px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sales</div>
                      <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#0f172a" }}>Orders</div>
                    </div>
                    <span className="btn line"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>Export</span>
                    <span className="btn solid"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New order</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> the page has one main action.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>D · Dark command header</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "76px", display: "flex", alignItems: "center", gap: "14px", padding: "0 22px", background: "#0b1733", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.8)" }}>{"Tracking & analytics"}</div>
                      <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#fff" }}>Analytics hub</div>
                    </div>
                    <div className="dseg">
                      <button type="button" style={{ background: "#fff", color: "#0b1733" }}>30 days</button>
                      <button type="button" style={{ background: "transparent", color: "rgba(226,232,240,.85)" }}>90 days</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> analytics, POS, focus modes.</span>
                  <code className="kcode">.hero</code>
                  {" "}
                  <code className="kcode">.dseg</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s13">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.3</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Page headers</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>The first block under the header. Pick one per page.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A · Text + actions</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Default</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#475569" }}>Everyone who works for you — shop, warehouse, riders and office.</div>
                    <span className="btn line"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="M17 8 12 3 7 8" />
  <path d="M12 3v12" />
</svg>Import</span>
                    <span className="btn solid"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add staff</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> simple list pages.</span>
                  <code className="kcode">pagehead(text, buttons)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>B · Dark hero with tiles</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <section className="hero" style={{ padding: "22px 24px" }}>
                    <div className="ey ey-d">G2 · Analytics hub</div>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", marginTop: "4px" }}>৳10.16L delivered from ৳1.85L of ads</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "16px" }}>
                      <div className="ht">
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Spend</span>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>৳1,85,000</span>
                        <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 8%</span>
                      </div>
                      <div className="ht">
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Delivered</span>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>৳10,16,000</span>
                        <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 14%</span>
                      </div>
                      <div className="ht">
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Real return</span>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>4.95×</span>
                        <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 9%</span>
                      </div>
                      <div className="ht">
                        <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>Cost / delivered</span>
                        <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>৳183</span>
                        <span className="dl" style={{ background: "rgba(16,185,129,.16)", color: "#34d399", alignSelf: "flex-start" }}>▲ 3%</span>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> dashboards and analytics.</span>
                  <code className="kcode">.hero</code>
                  {" "}
                  <code className="kcode">.ht</code>
                  {" "}
                  <code className="kcode">.dl</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>C · Title + underline tabs</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <h3 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", flexGrow: "1" }}>Leave</h3>
                      <span className="btn solid sm">Apply on behalf</span>
                    </div>
                    <div className="ptabs" style={{ padding: "0", marginTop: "10px" }}>
                      <span className="ptab on">Requests<span className="pcnt">4</span></span>
                      <span className="ptab">Leave calendar</span>
                      <span className="ptab">Balances</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> one record type seen several ways.</span>
                  <code className="kcode">.ptabs</code>
                  {" "}
                  <code className="kcode">.ptab.on</code>
                  {" "}
                  <code className="kcode">.pcnt</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>D · Record header</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 22px", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff" }}>
                    <span style={{ width: "60px", height: "60px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>SA</span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>Sadia Akter</span>
                        <span className="dl" style={{ background: "rgba(16,185,129,.2)", color: "#6ee7b7" }}>Active</span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "rgba(203,216,238,.8)" }}>Cashier · Dhanmondi branch · EMP-0142</div>
                    </div>
                    <span className="btn sm" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>Message</span>
                    <span className="btn sm" style={{ background: "#fff", color: "#0b1733" }}>Edit</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> a single customer, staff or supplier.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s14">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.4</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Tabs, segments and filters</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Tabs change the view of the same data. Segments pick a value. Chips filter.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A · Pill tabs with count</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Lists</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span className="tab on">All<span style={{ minWidth: "20px", height: "20px", padding: "0 6px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.2)", fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>240</span></span>
                    <span className="tab">Pending</span>
                    <span className="tab">Shipped</span>
                    <span className="tab">Returned</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.tab</code>
                  {" "}
                  <code className="kcode">.tab.on</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>B · Underline tabs</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Records</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div className="ptabs" style={{ padding: "0" }}>
                    <span className="ptab on">Overview</span>
                    <span className="ptab">Orders<span className="pcnt">12</span></span>
                    <span className="ptab">Tickets</span>
                    <span className="ptab">Notes</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.ptabs</code>
                  {" "}
                  <code className="kcode">.ptab</code>
                  {" "}
                  <code className="kcode">.pcnt</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>C · Segment · light</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div className="lseg">
                    <button type="button" style={{ background: "#fff", color: "#0b1733", boxShadow: "0 1px 2px rgba(15,23,42,.08)" }}>Day</button>
                    <button type="button" style={{ background: "transparent", color: "var(--text-muted)" }}>Week</button>
                    <button type="button" style={{ background: "transparent", color: "var(--text-muted)" }}>Month</button>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.lseg</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>D · Segment · rounded</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                    <span style={{ height: "34px", padding: "0 16px", borderRadius: "var(--radius-full)", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Table</span>
                    <span style={{ height: "34px", padding: "0 16px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", display: "inline-flex", alignItems: "center" }}>Cards</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">seg(h)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>E · Segment · dark</span>
                  <span className="ktag" style={{ background: "#0b1733", color: "#fff" }}>Analytics</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#0b1733" }}>
                    <div className="dseg">
                      <button type="button" style={{ background: "#fff", color: "#0b1733" }}>7 days</button>
                      <button type="button" style={{ background: "transparent", color: "rgba(226,232,240,.85)" }}>30 days</button>
                      <button type="button" style={{ background: "transparent", color: "rgba(226,232,240,.85)" }}>90 days</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.dseg</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>F · Filter chips</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span className="chip on">Active<span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>11</span></span>
                    <span className="chip">Probation</span>
                    <span className="chip">On leave</span>
                    <span className="chip">Suspended</span>
                    <span className="chip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>More filters</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.chip</code>
                  {" "}
                  <code className="kcode">.chip.on</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>G · Vertical section nav</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Settings</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ width: "240px", padding: "8px", border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ height: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>
                      <span style={{ flexGrow: "1" }}>Departments</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>7</span>
                    </div>
                    <div style={{ height: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", background: "#0b1733", color: "#fff" }}>
                      <span style={{ flexGrow: "1" }}>Salary components</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>10</span>
                    </div>
                    <div style={{ height: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>
                      <span style={{ flexGrow: "1" }}>Leave types</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>7</span>
                    </div>
                    <div style={{ height: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>
                      <span style={{ flexGrow: "1" }}>Attendance rules</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }} />
                    </div>
                    <div style={{ height: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>
                      <span style={{ flexGrow: "1" }}>Holidays</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>8</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> settings with 4+ sections.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s15">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.5</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Breadcrumbs, pagination and steps</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>How people know where they are, and how far along a task is.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Breadcrumbs</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                    <a href="#">{"Stocks & Inventory"}</a>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <a href="#">Warehouses</a>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span style={{ color: "#0f172a", fontWeight: "var(--weight-medium)" }}>Central Warehouse</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">› chevron 14px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Pagination · numbered</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginRight: "10px" }}>1–25 of 412</span>
                    <span className="ib" style={{ width: "36px", height: "36px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </span>
                    <span style={{ minWidth: "36px", height: "36px", borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "#0b1733", color: "#fff" }}>1</span>
                    <span style={{ minWidth: "36px", height: "36px", borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>2</span>
                    <span style={{ minWidth: "36px", height: "36px", borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>3</span>
                    <span style={{ minWidth: "36px", height: "36px", borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>…</span>
                    <span style={{ minWidth: "36px", height: "36px", borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", background: "transparent", color: "#334155" }}>17</span>
                    <span className="ib" style={{ width: "36px", height: "36px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                    <select className="inp" aria-label="Per page" style={{ width: "110px", height: "36px", marginLeft: "8px" }}>
                      <option>25 / page</option>
                    </select>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> tables over 25 rows.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Load more</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span className="btn line">Load 25 more</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Showing 25 of 412</span>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> feeds and mobile lists.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Stepper · numbered</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "var(--fill-success)", color: "#fff" }}>✓</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Supplier</span>
                    </div>
                    <span style={{ flex: "1", minWidth: "24px", height: "2px", background: "#10b981" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "var(--fill-success)", color: "#fff" }}>✓</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Products</span>
                    </div>
                    <span style={{ flex: "1", minWidth: "24px", height: "2px", background: "#10b981" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#003087", color: "#fff" }}>3</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Review</span>
                    </div>
                    <span style={{ flex: "1", minWidth: "24px", height: "2px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", background: "#cbd5e1", color: "#fff" }}>4</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Send</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> forms in 3–5 steps.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Stepper · progress bars</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ flex: "1" }}>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <div style={{ fontSize: "var(--text-xs)", marginTop: "6px", color: "#003087", fontWeight: "var(--weight-medium)" }}>Choose</div>
                    </div>
                    <div style={{ flex: "1" }}>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                      <div style={{ fontSize: "var(--text-xs)", marginTop: "6px", color: "#003087", fontWeight: "var(--weight-medium)" }}>Paste ID</div>
                    </div>
                    <div style={{ flex: "1" }}>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#e2e8f0" }} />
                      <div style={{ fontSize: "var(--text-xs)", marginTop: "6px", color: "var(--text-muted)", fontWeight: "var(--weight-medium)" }}>Connect</div>
                    </div>
                    <div style={{ flex: "1" }}>
                      <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#e2e8f0" }} />
                      <div style={{ fontSize: "var(--text-xs)", marginTop: "6px", color: "var(--text-muted)", fontWeight: "var(--weight-medium)" }}>Verify</div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> wizards inside a modal.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Stepper · status cards</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "transparent" }}>
                      <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>✓</span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Attendance</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Checked</div>
                      </div>
                    </div>
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "#f5f8ff" }}>
                      <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>2</span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Salary sheet</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Now</div>
                      </div>
                    </div>
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "transparent" }}>
                      <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#cbd5e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>3</span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Approve</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Owner</div>
                      </div>
                    </div>
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "transparent" }}>
                      <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-full)", background: "#cbd5e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>4</span>
                      <div>
                        <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Pay</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bank · bKash</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> long processes such as payroll.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s16">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">1.6</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Search and command menu</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>One search box finds products, orders and customers, and takes a barcode scan.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Global search with scan</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Header</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", width: "300px" }}>
                    <span style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" placeholder="Search or scan any barcode" aria-label="Search" style={{ paddingLeft: "40px", paddingRight: "48px", background: "#f8fafc", height: "42px" }} />
                    <span style={{ position: "absolute", right: "5px", top: "5px", width: "32px", height: "32px", borderRadius: "var(--radius-md)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.inp</code>
                  {" "}
                  <code className="kcode">scan button 32px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Command menu · Ctrl K</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "20px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "100%", maxWidth: "620px", margin: "0 auto", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 24px 60px -24px rgba(15,23,42,.45)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <span style={{ flexGrow: "1", fontSize: "var(--text-sm-plus)", color: "#0f172a" }}>sunscr<span style={{ display: "inline-block", width: "1px", height: "18px", background: "#003087", verticalAlign: "middle" }} /></span>
                        <span className="kcode">Esc</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#f5f8ff" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", background: "#f1f4f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                          </svg>
                        </span>
                        <div style={{ flexGrow: "1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Sunscreen SPF50 50ml</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>SKU S-1040 · 84 in stock</div>
                        </div>
                        <span className="klbl">Product</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#fff" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", background: "#f1f4f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                        </span>
                        <div style={{ flexGrow: "1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>GC-24817 · Sunscreen × 2</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Rahima K. · delivered</div>
                        </div>
                        <span className="klbl">Order</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#fff" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", background: "#f1f4f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </span>
                        <div style={{ flexGrow: "1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Search “sunscr” in customers</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} />
                        </div>
                        <span className="klbl">Action</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> power users and staff at the till.</span>
                  <code className="kcode">no open animation — used many times a day</code>
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
