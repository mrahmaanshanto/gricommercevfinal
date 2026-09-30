'use client';
// Generated from design/templates/dev-reference/UIKit04FormLayouts.dc.html by scripts/convert-design.mjs.
// UI kit 04 · Form layouts — UI kit — Form layouts.
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

export default class UIKit04FormLayoutsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit04FormLayouts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3500px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "999px", background: "rgba(255,255,255,.1)", fontSize: "11.5px", fontWeight: "600", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev-reference" style={{ color: "#cbd8ee", fontSize: "13px", fontWeight: "600" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 04 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "40px", lineHeight: "46px", fontWeight: "700", letterSpacing: "-.03em", color: "#fff" }}>Form layouts</h1>
              <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Single column, two-column card, numbered sections, settings rows, tabs, wizard, drawer, modal, inline row, filter panel, live preview and error handling — each with a real GridCommerce example.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "999px", display: "inline-flex", alignItems: "center", fontSize: "12.5px", fontWeight: "600", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s41">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">4.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.02em", color: "#0f172a" }}>Form layouts</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "21px", color: "#64748b", maxWidth: "820px" }}>Twelve ways to lay out a form. Pick by how many fields there are and how often people use it.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>A · Single column</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Simple</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ maxWidth: "440px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Supplier name <span style={{ color: "#e11d48" }}>*</span></span>
                      <input className="inp" defaultValue="Rahman Traders" placeholder="" aria-label="Rahman Traders" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Phone <span style={{ color: "#e11d48" }}>*</span></span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span className="inp" style={{ width: "88px", display: "flex", alignItems: "center", fontWeight: "600" }}>+880</span>
                        <input className="inp" defaultValue="1711 223344" placeholder="" aria-label="1711 223344" />
                      </div>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Address</span>
                      <textarea className="inp" rows="2" aria-label="Address" style={{ height: "70px", padding: "10px 14px", resize: "none" }} defaultValue={"Chawkbazar, Dhaka"} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Pays within</span>
                      <select className="inp" aria-label="Choose">
                        <option>30 days</option>
                        <option>15 days</option>
                        <option>Cash on delivery</option>
                      </select>
                    </label>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" className="btn ghost">Cancel</button>
                      <button type="button" className="btn solid">Save supplier</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> 5 fields or fewer.</span>
                  <code className="kcode">max-width 440</code>
                  {" "}
                  <code className="kcode">gap 14</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>B · Two columns in a card</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Default</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ background: "#fff", border: "1px solid #e6eaf0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Branch details</div>
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>Used on receipts and transfer slips.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Branch name <span style={{ color: "#e11d48" }}>*</span></span>
                        <input className="inp" defaultValue="Dhanmondi branch" placeholder="" aria-label="Dhanmondi branch" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Short code</span>
                        <input className="inp" defaultValue="DH-1" placeholder="" aria-label="DH-1" />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>On receipts</span>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Manager</span>
                        <select className="inp" aria-label="Choose">
                          <option>Rakib Hasan</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Phone</span>
                        <input className="inp" defaultValue="01712-XX4410" placeholder="" aria-label="01712-XX4410" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Opening hours</span>
                        <input className="inp" defaultValue="Sat–Thu 10 am – 10 pm" placeholder="" aria-label="Sat–Thu 10 am – 10 pm" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Gets stock from</span>
                        <select className="inp" aria-label="Choose">
                          <option>Central Warehouse</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> related fields that fit side by side.</span>
                  <code className="kcode">grid 2 cols · gap 14</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>C · Numbered sections</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Guided</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "999px", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>1</span>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>What does the customer get?</div>
                          <div style={{ fontSize: "12.5px", color: "#64748b" }}>Pick one</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <span className="chip on">% off</span>
                        <span className="chip">৳ off</span>
                      </div>
                    </section>
                    <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "999px", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>2</span>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>The code</div>
                          <div style={{ fontSize: "12.5px", color: "#64748b" }}>Customers type this at checkout</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Code</span>
                          <input className="inp" defaultValue="EID20" placeholder="" aria-label="EID20" />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Uses</span>
                          <input className="inp" defaultValue="500" placeholder="" aria-label="500" />
                        </label>
                      </div>
                    </section>
                    <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "999px", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>3</span>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Who can use it</div>
                          <div style={{ fontSize: "12.5px", color: "#64748b" }} />
                        </div>
                      </div>
                      <select className="inp" aria-label="Choose">
                        <option>Everyone</option>
                        <option>New customers</option>
                        <option>A customer group</option>
                      </select>
                    </section>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> long forms read top to bottom by beginners.</span>
                  <code className="kcode">numsec(n, title, sub, inner)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>D · Settings rows</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Settings</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ background: "#fff", border: "1px solid #e6eaf0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Payroll settings</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Pay day</div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>Salary for a month is paid on</div>
                      </div>
                      <select className="inp" aria-label="Pay day" style={{ width: "210px" }}>
                        <option>1st of next month</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Rounding</div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>Net pay rounded to</div>
                      </div>
                      <select className="inp" aria-label="Rounding" style={{ width: "210px" }}>
                        <option>Nearest ৳1</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Send payslip by SMS</div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>A short link goes to each person</div>
                      </div>
                      <button type="button" role="switch" aria-checked="true" aria-label="SMS payslip" className="sw on" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Post salary to Accounting</div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>Booked when payroll is paid</div>
                      </div>
                      <button type="button" role="switch" aria-checked="false" aria-label="Post" className="sw" />
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> settings — each row saves by itself.</span>
                  <code className="kcode">rrow(title, sub, control)</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>E · Tabbed form</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Big records</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e6eaf0", borderRadius: "16px", overflow: "hidden", background: "#fff" }}>
                    <div style={{ display: "flex", gap: "4px", padding: "6px", background: "#f8fafc", borderBottom: "1px solid #eef1f6" }}>
                      <span style={{ height: "38px", padding: "0 12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "transparent", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "999px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#10b981", color: "#fff" }}>✓</span>Basics</span>
                      <span style={{ height: "38px", padding: "0 12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "transparent", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "999px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#10b981", color: "#fff" }}>✓</span>Pricing</span>
                      <span style={{ height: "38px", padding: "0 12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "#0b1733", color: "#fff" }}><span style={{ width: "18px", height: "18px", borderRadius: "999px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.2)", color: "#fff" }}>3</span>Inventory</span>
                      <span style={{ height: "38px", padding: "0 12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "transparent", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "999px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0", color: "#64748b" }}>4</span>Validity</span>
                      <span style={{ height: "38px", padding: "0 12px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", background: "transparent", color: "#334155" }}><span style={{ width: "18px", height: "18px", borderRadius: "999px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0", color: "#64748b" }}>5</span>Shipping</span>
                    </div>
                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">SKU</span>
                          <input className="inp" defaultValue="FD-PKL-400" placeholder="" aria-label="FD-PKL-400" />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Barcode</span>
                          <input className="inp" defaultValue="8941600200146" placeholder="" aria-label="8941600200146" />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Stock now</span>
                          <input className="inp" defaultValue="86" placeholder="" aria-label="86" />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Alert when below</span>
                          <input className="inp" defaultValue="10" placeholder="" aria-label="10" />
                        </label>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderTop: "1px solid #eef1f6", background: "#fbfcfe" }}>
                      <span style={{ flexGrow: "1", fontSize: "12.5px", color: "#64748b" }}>Step 3 of 5</span>
                      <button type="button" className="btn line sm">Back: Pricing</button>
                      <span style={{ width: "8px" }} />
                      <button type="button" className="btn solid sm">Next: Validity</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> a big record (product) split into chunks.</span>
                  <code className="kcode">tab done ✓</code>
                  {" "}
                  <code className="kcode">prev / next footer</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>F · Wizard in a modal</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>Setup</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(15,23,42,.45)" }}>
                    <div style={{ maxWidth: "480px", margin: "0 auto", background: "#fff", borderRadius: "20px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.5)" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "17px", fontWeight: "700", flexGrow: "1" }}>Connect a platform</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <div style={{ flex: "1", height: "5px", borderRadius: "999px", background: "#003087" }} />
                        <div style={{ flex: "1", height: "5px", borderRadius: "999px", background: "#003087" }} />
                        <div style={{ flex: "1", height: "5px", borderRadius: "999px", background: "#e2e8f0" }} />
                        <div style={{ flex: "1", height: "5px", borderRadius: "999px", background: "#e2e8f0" }} />
                      </div>
                      <div style={{ fontWeight: "600" }}>Paste your Pixel ID</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>Events Manager › Data sources.</div>
                      <input className="inp" placeholder="Pixel ID" aria-label="Pixel ID" />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button type="button" className="btn line">Back</button>
                        <button type="button" className="btn solid">Next</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> setup that must happen in order.</span>
                  <code className="kcode">modal 480</code>
                  {" "}
                  <code className="kcode">progress bars</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>G · Side drawer</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ position: "relative", height: "380px", borderRadius: "14px", background: "#eef2f7", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: "0", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", opacity: ".5" }}>
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                      <div style={{ height: "36px", borderRadius: "8px", background: "#fff" }} />
                    </div>
                    <div style={{ position: "absolute", inset: "0", background: "rgba(15,23,42,.25)" }} />
                    <div style={{ position: "absolute", top: "0", right: "0", bottom: "0", width: "330px", background: "#fff", boxShadow: "-20px 0 40px -20px rgba(15,23,42,.4)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontWeight: "700", flexGrow: "1" }}>Give advance</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </div>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Staff</span>
                        <select className="inp" aria-label="Choose">
                          <option>Tareq Aziz · Stock keeper</option>
                        </select>
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Amount</span>
                          <input className="inp" defaultValue="৳5,000" placeholder="" aria-label="৳5,000" />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Pay back in</span>
                          <select className="inp" aria-label="Choose">
                            <option>2 months</option>
                          </select>
                        </label>
                      </div>
                      <div style={{ padding: "12px", borderRadius: "12px", background: "#f5f8ff" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Cut every month</div>
                        <div className="tn" style={{ fontSize: "22px", fontWeight: "800", color: "#003087" }}>৳2,500</div>
                      </div>
                      <span style={{ flexGrow: "1" }} />
                      <button type="button" className="btn solid">Save and pay out</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> editing one row without leaving the list.</span>
                  <code className="kcode">drawer 330–420px</code>
                  {" "}
                  <code className="kcode">slides from right 250ms ease-out</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>H · Centered modal</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(15,23,42,.45)" }}>
                    <div style={{ maxWidth: "420px", margin: "0 auto", background: "#fff", borderRadius: "20px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ fontSize: "17px", fontWeight: "700" }}>Add a holiday</div>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Date</span>
                        <input className="inp" defaultValue="16 Dec 2026" placeholder="" aria-label="16 Dec 2026" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Holiday</span>
                        <input className="inp" defaultValue="Victory Day" placeholder="" aria-label="Victory Day" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Where</span>
                        <select className="inp" aria-label="Choose">
                          <option>All branches</option>
                        </select>
                      </label>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button type="button" className="btn ghost">Cancel</button>
                        <button type="button" className="btn solid">Add holiday</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> 3–4 fields, quick add.</span>
                  <code className="kcode">modal 420</code>
                  {" "}
                  <code className="kcode">scale .96 → 1, 200ms</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>I · Inline add row</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th className="r">Price</th>
                        <th className="r">Stock</th>
                        <th>SKU</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row">
                        <td>400 g jar</td>
                        <td className="r tn">৳350</td>
                        <td className="r tn">126</td>
                        <td className="mono">FD-PKL-400</td>
                        <td />
                      </tr>
                      <tr style={{ background: "#f5f8ff" }}>
                        <td>
                          <input className="inp" defaultValue="1 kg jar" aria-label="Variant" style={{ height: "36px" }} />
                        </td>
                        <td>
                          <input className="inp tn" defaultValue="৳780" aria-label="Price" style={{ height: "36px", textAlign: "right" }} />
                        </td>
                        <td>
                          <input className="inp tn" defaultValue="48" aria-label="Stock" style={{ height: "36px", textAlign: "right" }} />
                        </td>
                        <td>
                          <input className="inp mono" defaultValue="FD-PKL-1K" aria-label="SKU" style={{ height: "36px" }} />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button type="button" className="btn solid sm" aria-label="Save">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </button>
                            <button type="button" className="ib" aria-label="Cancel" style={{ width: "36px", height: "36px" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button type="button" className="abtn" style={{ alignSelf: "flex-start" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add option</button>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> rows that belong to a parent: variants, lines on a PO.</span>
                  <code className="kcode">input 36px in cell</code>
                  {" "}
                  <code className="kcode">Enter saves · Esc cancels</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>J · Filter panel</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ maxWidth: "300px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", flexGrow: "1" }}>Filters</span>
                      <span style={{ fontSize: "12.5px", color: "#003087", fontWeight: "600" }}>Clear all</span>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Signed up</span>
                      <select className="inp" aria-label="Choose">
                        <option>Today</option>
                        <option>Last 7 days</option>
                        <option>This month</option>
                      </select>
                    </label>
                    <div>
                      <div className="lbl" style={{ marginBottom: "6px" }}>Spent</div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input className="inp" defaultValue="৳0" placeholder="" aria-label="৳0" />
                        <span>to</span>
                        <input className="inp" defaultValue="৳50,000" placeholder="" aria-label="৳50,000" />
                      </div>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: "6px" }}>Tier</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span className="chip on">Gold</span>
                        <span className="chip on">Platinum</span>
                        <span className="chip">Silver</span>
                      </div>
                    </div>
                    <button type="button" className="btn solid">Show 128 customers</button>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> lists with many ways to narrow down.</span>
                  <code className="kcode">result count on the button</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>K · Form with live preview</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                    <div style={{ background: "#fff", border: "1px solid #e6eaf0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>Warranty</div>
                      </div>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Period</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp" defaultValue="12" placeholder="" aria-label="12" style={{ width: "80px" }} />
                          <select className="inp" aria-label="Choose">
                            <option>months</option>
                          </select>
                        </div>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Covers</span>
                        <input className="inp" defaultValue="Manufacturing defects" placeholder="" aria-label="Manufacturing defects" />
                      </label>
                    </div>
                    <div style={{ padding: "16px", borderRadius: "16px", background: "#f1f5f9" }}>
                      <div className="klbl" style={{ marginBottom: "8px" }}>Customer sees</div>
                      <div style={{ padding: "14px", borderRadius: "12px", background: "#e8f1fd" }}>
                        <div style={{ fontWeight: "700" }}>12 months brand warranty</div>
                        <div style={{ fontSize: "12.5px", color: "#475569" }}>Covers manufacturing defects</div>
                        <div style={{ fontSize: "12.5px", color: "#0a5bd0", fontWeight: "600", marginTop: "6px" }}>See full warranty policy ›</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> anything customers will see: offers, receipts, messages.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", flexGrow: "1" }}>L · Errors and save bar</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", padding: "12px 14px", borderRadius: "12px", background: "#fff5f5", border: "1px solid #fecdd3", color: "#9f1239", fontSize: "13px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <div>
                        <b>2 things to fix before saving</b>
                        <div>• Phone number is too short · • Pick a category</div>
                      </div>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Phone</span>
                      <input className="inp err" defaultValue="01712-34" aria-label="Phone" />
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        <span style={{ color: "#be123c" }}>Enter an 11-digit number</span>
                      </span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "14px", background: "#0b1733", color: "#fff" }}>
                      <span style={{ flexGrow: "1", fontSize: "13px" }}>You have unsaved changes</span>
                      <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Discard</button>
                      <button type="button" className="btn sm" style={{ background: "#fff", color: "#0b1733" }}>Save</button>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> every form — summary at top, message under the field.</span>
                  <code className="kcode">focus first error</code>
                  {" "}
                  <code className="kcode">sticky bar when dirty</code>
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
