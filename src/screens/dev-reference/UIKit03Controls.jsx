'use client';
// Generated from design/templates/dev-reference/UIKit03Controls.dc.html by scripts/convert-design.mjs.
// UI kit 03 · Form controls — UI kit — Form controls.
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
    var v = { sa: mkSw(self, 'sa', true), sb: mkSw(self, 'sb', false) };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#64748b}
.num{font-variant-numeric:tabular-nums}
.ai{height:30px;padding:0 10px;border-radius:8px;border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:12.5px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:48px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:600}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2f6;color:#475569;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:10px;border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#003087}

.tc{background:#fff;border:1px solid #e7ebf2;border-radius:18px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -20px rgba(15,23,42,.18)}
.ey{font-size:11px;line-height:14px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#64748b}
.ey-d{color:rgba(203,216,238,.7)}
.tn{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:-.02em}
.dl{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:700;font-variant-numeric:tabular-nums}
.hero{position:relative;overflow:hidden;border-radius:22px;background:#0b1733;color:#fff;padding:24px 26px}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.hero>*{position:relative}
.ht{border-radius:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.dseg{display:inline-flex;padding:3px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.dseg button{height:32px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.lseg{display:inline-flex;padding:3px;border-radius:12px;background:#f1f4f9;border:1px solid #e7ebf2}
.lseg button{height:32px;padding:0 13px;border:0;border-radius:9px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease,box-shadow 200ms ease}
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
.tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px) scale(.97);transform-origin:bottom center;opacity:0;pointer-events:none;transition:opacity 125ms ease-out,transform 125ms ease-out;background:#0b1733;color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;white-space:nowrap;box-shadow:0 10px 24px -8px rgba(15,23,42,.45);z-index:5}
.col{position:relative;flex:1;height:100%;border-radius:6px;transition:background-color 150ms ease}
.col .tip{bottom:auto;top:6px}
.col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(15,23,42,.18);opacity:0;transition:opacity 125ms ease}
@media (hover:hover) and (pointer:fine){.tt:hover .tip,.col:hover .tip{opacity:1;transform:translate(-50%,0) scale(1)}.col:hover .cl{opacity:1}.row:hover{background:#f7f9fd}.tc.lift{transition:box-shadow 200ms ease,transform 200ms cubic-bezier(.23,1,.32,1)}.tc.lift:hover{box-shadow:0 1px 2px rgba(15,23,42,.05),0 18px 40px -20px rgba(15,23,42,.3)}}
.tb{width:100%;border-collapse:separate;border-spacing:0}
.tb th{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe;white-space:nowrap}
.tb td{padding:13px 16px;border-bottom:1px solid #f1f4f8;font-size:13.5px;vertical-align:middle}
.tb tr:last-child td{border-bottom:0}
.tb .r{text-align:right}
@media (prefers-reduced-motion:reduce){.st>*,.gr,.draw,.fadein{animation:none}}

.kdoc{width:1440px;background:#f4f6fa;font-family:'Poppins',system-ui,sans-serif;color:#334155}
.ksec{padding:36px 48px 8px;display:flex;flex-direction:column;gap:20px}
.ksh{display:flex;align-items:flex-end;gap:16px;padding-bottom:14px;border-bottom:1px solid #e3e8ef}
.knum{font-size:12px;font-weight:700;color:#0a5bd0;letter-spacing:.1em}
.kspec{background:#fff;border:1px solid #e7ebf2;border-radius:18px;overflow:hidden;display:flex;flex-direction:column}
.kspec-h{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe}
.kspec-b{padding:22px;display:flex;flex-direction:column;gap:14px}
.kspec-f{padding:10px 16px;border-top:1px solid #eef1f6;background:#fbfcfe;font-size:12px;color:#64748b;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.kcode{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;padding:2px 7px;border-radius:6px;background:#eef2f8;color:#1e3a8a}
.ktag{height:22px;padding:0 8px;border-radius:999px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;letter-spacing:.04em}
.kgrid{display:grid;gap:18px}
.klbl{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8}
.ghost{background:transparent;color:#334155}.ghost:hover{background:#f1f5f9}
.danger{background:#be123c;color:#fff}.danger:hover{background:#9f1239;color:#fff}
.succ{background:#047857;color:#fff}
.inp.err{border-color:#e11d48;background:#fff8f9}.inp.ok{border-color:#10b981}
.inp[disabled]{background:#f1f5f9;color:#94a3b8;cursor:not-allowed}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.sk{background:linear-gradient(90deg,#eef1f6 25%,#f7f9fc 37%,#eef1f6 63%);background-size:400% 100%;animation:skel 1.4s ease infinite;border-radius:8px}
@keyframes skel{0%{background-position:100% 50%}100%{background-position:0 50%}}
.spin{animation:spin 700ms linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
`;

// ---- markup ----

export default class UIKit03ControlsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit03Controls">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3800px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "999px", background: "rgba(255,255,255,.1)", fontSize: "11.5px", fontWeight: "600", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev-reference" style={{ color: "#cbd8ee", fontSize: "13px", fontWeight: "600" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 03 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "40px", lineHeight: "46px", fontWeight: "700", letterSpacing: "-.03em", color: "#fff" }}>Form controls</h1>
              <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Every input a backend form needs, in every state — text, money, phone, barcode, selects, trees, switches, questions, dates, files, OTP and AI-assisted fields.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s31">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">3.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Text inputs</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "21px", color: "#64748b", maxWidth: "820px" }}>44 px tall, 8 px corners, label always above. Helper text below; errors replace it.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>States</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Core</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Default</span>
                      <input className="inp " placeholder="Product name" aria-label="Product name" />
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>Shown on the website and receipt</span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Filled</span>
                      <input className="inp " defaultValue="Mango Pickle 400g" placeholder="" aria-label="Mango Pickle 400g" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Focus</span>
                      <input className="inp " defaultValue="Mango Pickle" placeholder="" aria-label="Mango Pickle" style={{ borderColor: "#003087", boxShadow: "0 0 0 3px rgba(0,48,135,.15)" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Error <span style={{ color: "#e11d48" }}>*</span></span>
                      <input className="inp err" defaultValue="01712-34" placeholder="" aria-label="01712-34" />
                      <span style={{ fontSize: "12px", color: "#be123c", display: "flex", alignItems: "center", gap: "4px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
  <path d="M12 9v4" />
  <path d="M12 17h.01" />
</svg>Enter an 11-digit number</span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Success</span>
                      <input className="inp ok" defaultValue="8941600200146" placeholder="" aria-label="8941600200146" />
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>Barcode is free</span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Disabled</span>
                      <input className="inp " defaultValue="EMP-0142" placeholder="" aria-label="EMP-0142" disabled />
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>Set by the system</span>
                    </label>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.inp</code>
                  {" "}
                  <code className="kcode">.inp.err</code>
                  {" "}
                  <code className="kcode">.inp.ok</code>
                  {" "}
                  <code className="kcode">[disabled]</code>
                  {" "}
                  <code className="kcode">focus ring 3px rgba(0,48,135,.15)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>With prefix, suffix and icons</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Price</span>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "11px", fontWeight: "600", color: "#475569" }}>৳</span>
                        <input className="inp " defaultValue="350" placeholder="" aria-label="350" style={{ paddingLeft: "32px" }} />
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Weight</span>
                      <div style={{ display: "flex" }}>
                        <input className="inp " defaultValue="0.52" placeholder="" aria-label="0.52" style={{ borderRadius: "8px 0 0 8px" }} />
                        <span style={{ height: "44px", padding: "0 14px", border: "1px solid #cbd5e1", borderLeft: "0", borderRadius: "0 8px 8px 0", background: "#f8fafc", display: "flex", alignItems: "center", fontSize: "13px", color: "#475569" }}>kg</span>
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Search</span>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </span>
                        <input className="inp " placeholder="Name, phone or SKU" aria-label="Name, phone or SKU" style={{ paddingLeft: "40px" }} />
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Barcode</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input className="inp mono" defaultValue="8941600200146" placeholder="" aria-label="8941600200146" />
                        <button type="button" className="btn soft" aria-label="Scan">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <path d="M8 7v10" />
                            <path d="M12 7v10" />
                            <path d="M17 7v10" />
                          </svg>
                        </button>
                        <button type="button" className="btn line">Make one</button>
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Phone</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ height: "44px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>BD +880</span>
                        <input className="inp " defaultValue="1712 345678" placeholder="" aria-label="1712 345678" />
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>Saved as +8801712345678</span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Password</span>
                      <div style={{ position: "relative" }}>
                        <input className="inp " defaultValue="••••••••" placeholder="" aria-label="••••••••" type="password" />
                        <span style={{ position: "absolute", right: "10px", top: "10px", color: "#64748b" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>8+ characters · one number</span>
                    </label>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">৳ prefix</code>
                  {" "}
                  <code className="kcode">unit suffix</code>
                  {" "}
                  <code className="kcode">icon left 40px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>{"Textarea & rich text"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Short description <span className="bn" style={{ color: "#94a3b8", fontWeight: "400" }}>· সংক্ষিপ্ত বিবরণ</span></span>
                      <textarea className="inp" rows="3" aria-label="Short description" style={{ height: "88px", padding: "10px 14px", resize: "none" }} defaultValue={"Sun-dried green mangoes in mustard oil. No preservatives."} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                        <span>Shown under the price</span>
                        <span className="tn">62 / 160</span>
                      </div>
                    </label>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ display: "flex", gap: "2px", padding: "6px 8px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "13px", fontWeight: "700", color: "#475569" }}>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0" }}>B</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>I</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>H2</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>•</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1.</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>“</span>
                        <span style={{ width: "30px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>↗</span>
                        <span style={{ flexGrow: "1" }} />
                        <button type="button" className="ai"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>AI</button>
                      </div>
                      <div style={{ padding: "12px 14px", minHeight: "90px", fontSize: "14px", lineHeight: "22px", color: "#334155" }}><b>Made the old way.</b> Raw green mangoes, sun-dried for three days, then slow-cooked with mustard oil and panch phoron.</div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">char counter</code>
                  {" "}
                  <code className="kcode">toolbar 28px buttons</code>
                  {" "}
                  <code className="kcode">.ai assist</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s32">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">3.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Choosing from a list</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "21px", color: "#64748b", maxWidth: "820px" }}>Native select for short lists. Searchable combobox for suppliers, customers and products. Tags for many values.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Select</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Warranty policy</span>
                    <select className="inp" aria-label="Choose">
                      <option>Smartphone brand warranty · 12 months</option>
                      <option>Shop service · 6 months</option>
                      <option>7-day replacement</option>
                    </select>
                  </label>
                </div>
                <div className="kspec-f">
                  <code className="kcode">select.inp</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Multi-select tags</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Tags</span>
                    <div className="inp" style={{ height: "auto", minHeight: "44px", padding: "6px 8px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                      <span style={{ height: "28px", padding: "0 6px 0 10px", borderRadius: "6px", background: "#eef2f8", fontSize: "12.5px", fontWeight: "600", color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: "4px" }}>Skin care<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg></span>
                      <span style={{ height: "28px", padding: "0 6px 0 10px", borderRadius: "6px", background: "#eef2f8", fontSize: "12.5px", fontWeight: "600", color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: "4px" }}>Sunscreen<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg></span>
                      <span style={{ height: "28px", padding: "0 6px 0 10px", borderRadius: "6px", background: "#eef2f8", fontSize: "12.5px", fontWeight: "600", color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: "4px" }}>Best seller<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg></span>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>Add tag…</span>
                    </div>
                  </label>
                </div>
                <div className="kspec-f">
                  <code className="kcode">chips inside .inp</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Searchable combobox</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Supplier</span>
                    <div style={{ position: "relative" }}>
                      <div className="inp" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: "#003087", boxShadow: "0 0 0 3px rgba(0,48,135,.15)" }}>
                        <span>Rahm</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                      <div style={{ position: "absolute", left: "0", right: "0", top: "50px", zIndex: "2", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 16px 32px -12px rgba(15,23,42,.3)", padding: "6px" }}>
                        <div style={{ padding: "9px 10px", borderRadius: "8px", fontSize: "13.5px", background: "#f5f8ff" }}><b>Rahm</b>an Traders<div style={{ fontSize: "11.5px", color: "#64748b" }}>Supplier · due ৳42,500</div></div>
                        <div style={{ padding: "9px 10px", borderRadius: "8px", fontSize: "13.5px", background: "#fff" }}><b>Rahm</b>at Foods<div style={{ fontSize: "11.5px", color: "#64748b" }}>Supplier · Chattogram</div></div>
                        <div style={{ padding: "9px 10px", fontSize: "13px", color: "#003087", fontWeight: "600", borderTop: "1px solid #eef1f6", marginTop: "4px" }}>+ Add “Rahm” as a new supplier</div>
                      </div>
                    </div>
                  </label>
                  <div style={{ height: "120px" }} />
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> lists over 10 items.</span>
                  <code className="kcode">create-new row</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Category tree</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "8px", fontSize: "13.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", paddingLeft: "8px", borderRadius: "8px", background: "transparent", color: "#334155" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>Skin care</span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>64</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", paddingLeft: "26px", borderRadius: "8px", background: "#f5f8ff", color: "#003087" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>Sunscreen</span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>12</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", paddingLeft: "26px", borderRadius: "8px", background: "transparent", color: "#334155" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>Toner</span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>9</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", paddingLeft: "8px", borderRadius: "8px", background: "transparent", color: "#334155" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>Grocery</span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>89</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", paddingLeft: "26px", borderRadius: "8px", background: "transparent", color: "#334155" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      <span style={{ flexGrow: "1" }}>Pickles</span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>14</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> picking a category.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Radio cards</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <label style={{ display: "flex", gap: "10px", padding: "14px", borderRadius: "12px", border: "1.5px solid #003087", background: "#f5f8ff", cursor: "pointer" }}>
                      <span style={{ width: "18px", height: "18px", borderRadius: "999px", border: "2px solid #003087", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", marginTop: "1px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#003087" }} />
                      </span>
                      <span>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Destroy here</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Made unusable and thrown away</span>
                      </span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", padding: "14px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                      <span style={{ width: "18px", height: "18px", borderRadius: "999px", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", marginTop: "1px" }} />
                      <span>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Return to supplier</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Supplier gives credit</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> 2–4 options with an explanation each.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s33">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">3.3</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Yes / no and on / off</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "21px", color: "#64748b", maxWidth: "820px" }}>Switch = takes effect now. Checkbox = picked, saved with the form. Yes/No question = for people new to computers.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Switch rows</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Live</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Sell the oldest batch first</div>
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>Picking and POS take the batch that expires first</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.sa?.on} aria-label="Sell the oldest batch first" className={v.sa?.cls} onClick={v.sa?.toggle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Pickup point</div>
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>Customers can buy online and collect here</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.sb?.on} aria-label="Pickup point" className={v.sb?.cls} onClick={v.sb?.toggle} />
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.sw</code>
                  {" "}
                  <code className="kcode">.sw.on</code>
                  {" "}
                  <code className="kcode">{"role=\"switch\""}</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Checkboxes</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #003087", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>
                        <span style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Invoice and receipt</span>
                      </span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #003087", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>
                        <span style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Warranty card with QR</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Printed with the order</span>
                      </span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #cbd5e1", background: "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }} />
                      <span>
                        <span style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Order confirmation message</span>
                      </span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #cbd5e1", background: "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }} />
                      <span>
                        <span style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Customer account, per order</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">accent-color #003087</code>
                  {" "}
                  <code className="kcode">20px box</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Radio group</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "999px", border: "2px solid #003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#003087" }} />
                      </span>
                      <span style={{ fontSize: "14px" }}>Delivery date</span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "999px", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ fontSize: "14px" }}>Purchase date</span>
                    </label>
                    <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "999px", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ fontSize: "14px" }}>Activation date</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Plain-language question</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>1</span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Does this product come with a warranty?</div>
                      <div className="bn" style={{ fontSize: "13px", color: "#64748b" }}>এই পণ্যে কি ওয়ারেন্টি আছে?</div>
                    </div>
                    <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                      <span style={{ height: "34px", padding: "0 16px", borderRadius: "999px", background: "#0b1733", color: "#fff", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>Yes</span>
                      <span style={{ height: "34px", padding: "0 16px", fontSize: "13px", fontWeight: "600", color: "#475569", display: "inline-flex", alignItems: "center" }}>No</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> forms for shop owners and cashiers.</span>
                  <code className="kcode">seg Yes/No</code>
                  {" "}
                  <code className="kcode">Bangla helper</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Toggle chips (pick many)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #003087", background: "#f5f8ff", color: "#003087", fontSize: "13.5px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>Invoice</span>
                    <span style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #003087", background: "#f5f8ff", color: "#003087", fontSize: "13.5px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>IMEI</span>
                    <span style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "13.5px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>Warranty card</span>
                    <span style={{ height: "38px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "13.5px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>Original box</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s34">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">3.4</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Numbers, dates, files and more</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "21px", color: "#64748b", maxWidth: "820px" }}>Special inputs used across stock, orders and settings.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Quantity stepper</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                    <button type="button" aria-label="Less" style={{ width: "44px", height: "44px", border: "0", background: "#f8fafc", fontSize: "20px" }}>−</button>
                    <span className="tn" style={{ width: "60px", textAlign: "center", fontSize: "16px", fontWeight: "700" }}>12</span>
                    <button type="button" aria-label="More" style={{ width: "44px", height: "44px", border: "0", background: "#f8fafc", fontSize: "20px" }}>+</button>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> POS, receive goods, stock count.</span>
                  <code className="kcode">buttons 44px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Slider</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                      <span>Discount</span>
                      <b className="tn">20%</b>
                    </div>
                    <div style={{ position: "relative", height: "6px", borderRadius: "999px", background: "#e2e8f0" }}>
                      <div style={{ width: "40%", height: "100%", borderRadius: "999px", background: "#003087" }} />
                      <span style={{ position: "absolute", left: "40%", top: "-7px", width: "20px", height: "20px", marginLeft: "-10px", borderRadius: "999px", background: "#fff", border: "2px solid #003087", boxShadow: "0 2px 6px rgba(15,23,42,.2)" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">range · track 6px</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>OTP / PIN</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>4</span>
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>8</span>
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>2</span>
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>1</span>
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #003087", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }} />
                    <span style={{ width: "48px", height: "56px", borderRadius: "10px", border: "1.5px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }} />
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "8px" }}>Code sent to +880 1712-XXXXXX · resend in 0:42</div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> sign in and approvals.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>{"Date picker & range"}</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Asia/Dhaka</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ width: "300px", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "12px", boxShadow: "0 16px 32px -16px rgba(15,23,42,.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <span className="ib" style={{ width: "32px", height: "32px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </span>
                      <span style={{ flexGrow: "1", textAlign: "center", fontWeight: "700" }}>September 2026</span>
                      <span className="ib" style={{ width: "32px", height: "32px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center", fontSize: "12.5px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Sa</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Su</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Mo</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Tu</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>We</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Th</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", padding: "4px 0" }}>Fr</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", color: "#cbd5e1" }} />
                      <span style={{ padding: "7px 0", borderRadius: "8px", color: "#cbd5e1" }} />
                      <span style={{ padding: "7px 0", borderRadius: "8px", color: "#cbd5e1" }} />
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>1</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>2</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>3</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>4</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>5</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>6</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>7</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>8</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>9</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>10</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>11</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>12</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>13</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>14</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>15</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>16</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>17</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>18</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#003087", color: "#fff", fontWeight: "700" }}>19</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#e0e9fb", color: "#1e3a8a" }}>20</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#e0e9fb", color: "#1e3a8a" }}>21</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#e0e9fb", color: "#1e3a8a" }}>22</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#e0e9fb", color: "#1e3a8a" }}>23</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#e0e9fb", color: "#1e3a8a" }}>24</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", background: "#003087", color: "#fff" }}>25</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>26</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>27</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>28</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>29</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px" }}>30</span>
                      <span style={{ padding: "7px 0", borderRadius: "8px", color: "#cbd5e1" }} />
                      <span style={{ padding: "7px 0", borderRadius: "8px", color: "#cbd5e1" }} />
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">Saturday first</code>
                  {" "}
                  <code className="kcode">range tint #e0e9fb</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>{"File & image upload"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1.5px dashed #94a3b8", borderRadius: "14px", padding: "22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", background: "#f8fafc" }}>
                    <span style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="M17 8 12 3 7 8" />
                        <path d="M12 3v12" />
                      </svg>
                    </span>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>Drop photos here or <span style={{ color: "#003087" }}>browse</span></div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>JPG, PNG or WebP · up to 5 MB · square looks best</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    <div style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", background: "linear-gradient(160deg,#b45309,#0f172a)" }}>
                      <span style={{ position: "absolute", left: "6px", top: "6px", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "999px", background: "#fff", color: "#0f172a" }}>COVER</span>
                    </div>
                    <div style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", background: "linear-gradient(160deg,#475569,#0f172a)" }} />
                    <div style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", background: "linear-gradient(160deg,#1d4ed8,#0f172a)" }} />
                    <div style={{ aspectRatio: "1", borderRadius: "10px", border: "1.5px dashed #94a3b8", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                    <span style={{ flexGrow: "1", fontSize: "13px" }}>invoice-sept.pdf<span style={{ display: "block", height: "4px", borderRadius: "999px", background: "#e2e8f0", marginTop: "6px" }}>
  <span style={{ display: "block", width: "64%", height: "100%", background: "#003087", borderRadius: "999px" }} />
</span></span>
                    <span className="tn" style={{ fontSize: "12px", color: "#64748b" }}>64%</span>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>Colour swatches</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#111827", boxShadow: "0 0 0 2px #fff, 0 0 0 4px #003087" }} />
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.1)" }} />
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#1e3a8a", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.1)" }} />
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#dc2626", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.1)" }} />
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#cbd5e1", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.1)" }} />
                    <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#d97706", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.1)" }} />
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> variants: colour.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>{"Time & period"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Starts</span>
                      <input className="inp" type="time" defaultValue="09:00" aria-label="Start" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Ends</span>
                      <input className="inp" type="time" defaultValue="17:00" aria-label="End" />
                    </label>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Every</span>
                    <select className="inp" aria-label="Choose">
                      <option>1 month</option>
                      <option>3 months</option>
                      <option>Custom</option>
                    </select>
                  </label>
                </div>
                <div className="kspec-f">
                  <code className="kcode">input[type=time]</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>AI-assisted field</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="lbl" style={{ flexGrow: "1" }}>Long description</span>
                      <button type="button" className="ai"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                    </div>
                    <div className="inp" style={{ height: "auto", padding: "12px 14px", lineHeight: "21px", borderColor: "#a78bfa", background: "linear-gradient(135deg,#faf5ff,#f5f8ff)" }}>Our mango pickle is made the old way — raw green mangoes, sun-dried…<span style={{ display: "block", marginTop: "8px", fontSize: "12px", color: "#6d28d9", fontWeight: "600" }}>AI draft · check before saving</span></div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">.ai</code>
                  {" "}
                  <code className="kcode">violet border while AI text</code>
                </div>
              </div>
            </div>
          </section>
          <footer style={{ marginTop: "40px", padding: "22px 48px", borderTop: "1px solid #e3e8ef", display: "flex", gap: "16px", fontSize: "12.5px", color: "#94a3b8" }}>
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
