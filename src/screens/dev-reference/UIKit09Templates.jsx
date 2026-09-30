'use client';
// Generated from design/templates/dev-reference/UIKit09Templates.dc.html by scripts/convert-design.mjs.
// UI kit 09 · Page templates — UI kit — Page templates.
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

export default class UIKit09TemplatesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit09Templates">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3600px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 09 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>Page templates</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>Nine page types every backend screen is built from — list, record, form, settings, dashboard, wizard, queue, full-screen tool and phone — with the kit parts each one uses, plus the checklist before handover.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s91">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">9.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Page templates</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>Start every new screen from one of these. The same frame, spacing and parts — only the content changes.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>List page</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", height: "14px" }}>
                          <div style={{ flex: "0 0 50%", height: "10px", borderRadius: "var(--radius-md)", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569" }} />
                          <span style={{ flexGrow: "1" }} />
                          <div style={{ flex: "0 0 50px", height: "14px", borderRadius: "var(--radius-md)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569" }} />
                        </div>
                        <div style={{ display: "flex", gap: "6px", height: "40px" }}>
                          <div style={{ flex: "1", height: "40px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>KPI</div>
                          <div style={{ flex: "1", height: "40px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>KPI</div>
                          <div style={{ flex: "1", height: "40px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>KPI</div>
                          <div style={{ flex: "1", height: "40px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>KPI</div>
                        </div>
                        <div style={{ flexGrow: "1", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                          <span style={{ height: "12px", borderRadius: "3px", background: "#dbe4f0" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                          <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">page header A</span>
                      <span className="kcode">tiles A</span>
                      <span className="kcode">table A</span>
                      <span className="kcode">pagination</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/purchase-orders" style={{ fontWeight: "var(--weight-medium)" }}>See it: Purchase orders →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Record page</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ height: "50px", borderRadius: "var(--radius-md)", background: "#0b1733" }} />
                        <div style={{ display: "flex", gap: "6px", height: "150px" }}>
                          <div style={{ flex: "2", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Main column</div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ flex: "1", height: "60px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Summary</div>
                            <div style={{ flex: "1", height: "60px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Timeline</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">record header D</span>
                      <span className="kcode">underline tabs</span>
                      <span className="kcode">key–value list</span>
                      <span className="kcode">timeline</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/customer-crm" style={{ fontWeight: "var(--weight-medium)" }}>See it: Customer CRM →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Create / edit form</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", height: "170px" }}>
                          <div style={{ flex: "2", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Numbered sections</div>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ flex: "1", height: "70px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Status</div>
                            <div style={{ flex: "1", height: "70px", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Preview</div>
                          </div>
                        </div>
                        <div style={{ flex: "0 0 22px", height: "22px", borderRadius: "var(--radius-md)", background: "#0b1733", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">numbered sections</span>
                      <span className="kcode">side status card</span>
                      <span className="kcode">sticky save bar</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/add-product" style={{ fontWeight: "var(--weight-medium)" }}>See it: Add product →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Settings</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", height: "200px" }}>
                          <div style={{ width: "70px", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "4px" }}>
                            <span style={{ height: "12px", borderRadius: "3px", background: "#eef2f6" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#0b1733" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#eef2f6" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#eef2f6" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#eef2f6" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#eef2f6" }} />
                          </div>
                          <div style={{ flex: "1", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e2e8f0", padding: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ flexGrow: "1", height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                              <span style={{ width: "22px", height: "12px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">vertical nav</span>
                      <span className="kcode">settings rows</span>
                      <span className="kcode">switches</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/hr-setup" style={{ fontWeight: "var(--weight-medium)" }}>See it: HR setup →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Dashboard</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ height: "70px", borderRadius: "var(--radius-md)", background: "#0b1733", display: "flex", gap: "4px", padding: "30px 6px 6px" }}>
                          <span style={{ flex: "1", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.12)" }} />
                          <span style={{ flex: "1", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.12)" }} />
                          <span style={{ flex: "1", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.12)" }} />
                          <span style={{ flex: "1", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.12)" }} />
                          <span style={{ flex: "1", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,.12)" }} />
                        </div>
                        <div style={{ display: "flex", gap: "6px", height: "80px" }}>
                          <div style={{ flex: "2", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Chart</div>
                          <div style={{ flex: "1", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Donut</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", height: "50px" }}>
                          <div style={{ flex: "1", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }} />
                          <div style={{ flex: "1", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }} />
                          <div style={{ flex: "1", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">hero with tiles</span>
                      <span className="kcode">trend chart</span>
                      <span className="kcode">donut</span>
                      <span className="kcode">alert cards</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/analytics-hub" style={{ fontWeight: "var(--weight-medium)" }}>See it: Analytics hub →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Wizard</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ flexGrow: "1", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,.35)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ width: "55%", height: "80%", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", gap: "3px" }}>
                              <span style={{ flex: "1", height: "4px", borderRadius: "3px", background: "#003087" }} />
                              <span style={{ flex: "1", height: "4px", borderRadius: "3px", background: "#003087" }} />
                              <span style={{ flex: "1", height: "4px", borderRadius: "3px", background: "#e2e8f0" }} />
                              <span style={{ flex: "1", height: "4px", borderRadius: "3px", background: "#e2e8f0" }} />
                            </div>
                            <span style={{ flexGrow: "1", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }} />
                            <span style={{ alignSelf: "flex-end", width: "40px", height: "12px", borderRadius: "3px", background: "#003087" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">modal 480</span>
                      <span className="kcode">progress steps</span>
                      <span className="kcode">one question per step</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/pixels-events" style={{ fontWeight: "var(--weight-medium)" }}>See it: Connect a platform →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>List + detail (queue)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ width: "60px", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "6px" }}>
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#bfd0ea" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                      <span style={{ height: "8px", borderRadius: "3px", background: "#eef2f6" }} />
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", height: "200px" }}>
                          <div style={{ flex: "1", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "4px" }}>
                            <span style={{ height: "18px", borderRadius: "3px", background: "#e8eef9", borderLeft: "3px solid #003087" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                            <span style={{ height: "18px", borderRadius: "3px", background: "#f8fafc", borderLeft: "3px solid transparent" }} />
                          </div>
                          <div style={{ flex: "1.4", height: "100%", borderRadius: "var(--radius-md)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569", border: "1px solid #e2e8f0" }}>Detail + actions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">list with left bar</span>
                      <span className="kcode">detail with next step</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/warranty-claims" style={{ fontWeight: "var(--weight-medium)" }}>See it: Warranty claims →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Full-screen tool (POS)</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "6px", height: "260px", padding: "6px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", borderRadius: "var(--radius-lg)", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0", overflow: "hidden" }}>
                      <div style={{ height: "26px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "6px" }}>
                        <span style={{ width: "60px", height: "8px", borderRadius: "3px", background: "#cbd5e1" }} />
                        <span style={{ flexGrow: "1" }} />
                        <span style={{ width: "70px", height: "12px", borderRadius: "var(--radius-sm)", background: "#eef2f6" }} />
                      </div>
                      <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px", padding: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", height: "220px" }}>
                          <div style={{ flex: "2", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                            <span style={{ borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                          </div>
                          <div style={{ flex: "1", borderRadius: "var(--radius-md)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px", padding: "4px" }}>
                            <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                            <span style={{ height: "12px", borderRadius: "3px", background: "#f1f5f9" }} />
                            <span style={{ flexGrow: "1" }} />
                            <span style={{ height: "26px", borderRadius: "var(--radius-sm)", background: "#10b981" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">collapsed rail or none</span>
                      <span className="kcode">big buttons 52px</span>
                      <span className="kcode">sticky pay button</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/dev/storyboards/pos-register" style={{ fontWeight: "var(--weight-medium)" }}>See it: POS register →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Phone screen</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "260px", display: "flex", justifyContent: "center", alignItems: "center", background: "#eef2f7", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ width: "120px", height: "236px", borderRadius: "var(--radius-xl)", border: "5px solid #0f172a", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "5px", padding: "6px", overflow: "hidden" }}>
                      <span style={{ height: "14px", borderRadius: "3px", background: "#fff", border: "1px solid #e2e8f0" }} />
                      <span style={{ height: "60px", borderRadius: "var(--radius-md)", background: "#0b1220" }} />
                      <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                      <span style={{ height: "18px", borderRadius: "var(--radius-sm)", background: "#fff", border: "1px solid #e2e8f0" }} />
                      <span style={{ flexGrow: "1" }} />
                      <span style={{ height: "22px", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">390 × 844</span>
                      <span className="kcode">one task</span>
                      <span className="kcode">bottom action 56px</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/mobile-receive" style={{ fontWeight: "var(--weight-medium)" }}>See it: Receive goods on phone →</__Link>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s92">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">9.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Handover checklist</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }} />
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Printout</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ height: "260px", display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", background: "#eef2f7", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ width: "150px", height: "210px", background: "#fff", boxShadow: "0 6px 16px -8px rgba(15,23,42,.3)", padding: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span style={{ width: "50px", height: "8px", background: "#003087", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "6px", background: "#eef2f6", borderRadius: "2px" }} />
                    </div>
                    <div style={{ width: "70px", height: "170px", background: "#fff", boxShadow: "0 6px 16px -8px rgba(15,23,42,.3)", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                      <span style={{ height: "5px", background: "#eef2f6", borderRadius: "2px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">Built from</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="kcode">A4 invoice</span>
                      <span className="kcode">80 mm receipt</span>
                      <span className="kcode">label 50×30</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <__Link href="/dev/ui-kit08-commerce" style={{ fontWeight: "var(--weight-medium)" }}>See it: Printouts →</__Link>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 3" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Checklist before handing over a screen</span>
                  <span className="ktag" style={{ background: "#e7f8f1", color: "#047857" }}>Before review</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px 28px" }}>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Money shows as ৳ with Indian grouping (৳1,02,400)</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Dates are Asia/Dhaka, written 19 Sep 2026</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Every icon button has an aria-label</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Text contrast 4.5:1 or more; no grey-on-grey</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Touch targets 44 px (POS 52 px)</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>One solid button per area</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Status = colour + word, never colour alone</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Empty, loading and error states are designed</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Bangla helper text where people may need it</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Numbers use tabular figures in tables</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Motion under 300 ms; none on keyboard actions</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", fontSize: "var(--text-sm)", lineHeight: "20px" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span>Tested with prefers-reduced-motion</span>
                    </div>
                  </div>
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
