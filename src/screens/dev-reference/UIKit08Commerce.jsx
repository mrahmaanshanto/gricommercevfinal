'use client';
// Generated from design/templates/dev-reference/UIKit08Commerce.dc.html by scripts/convert-design.mjs.
// UI kit 08 · Commerce components — UI kit — Commerce components.
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

export default class UIKit08CommerceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="UIKit08Commerce">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="kdoc" style={{ minHeight: "3100px" }}>
          <header className="hero" style={{ borderRadius: "0", padding: "32px 48px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "28px" }} />
              <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.1)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd8ee" }}>UI kit · v1.0 · for backend screens</span>
              <span style={{ flexGrow: "1" }} />
              <__Link href="/dev/dev-reference" style={{ color: "#cbd8ee", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Foundations & tokens →"}</__Link>
            </div>
            <div style={{ marginTop: "22px" }}>
              <div className="ey ey-d">Kit 08 of 09</div>
              <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-4xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#fff" }}>Commerce components</h1>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "23px", color: "rgba(226,232,240,.8)", maxWidth: "860px" }}>The pieces that make GridCommerce a shop: products, prices in ৳, variants, stock and expiry, orders, bills, payment and courier choices, customers, addresses, points, coupons, warranty cards, messages and printouts.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "22px" }}>
              <__Link href="/dev/ui-kit01-shell" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"01 · Shell & navigation"}</__Link>
              <__Link href="/dev/ui-kit02-actions" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"02 · Buttons, badges & identity"}</__Link>
              <__Link href="/dev/ui-kit03-controls" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>03 · Form controls</__Link>
              <__Link href="/dev/ui-kit04-form-layouts" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>04 · Form layouts</__Link>
              <__Link href="/dev/ui-kit05-tables" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"05 · Tables & lists"}</__Link>
              <__Link href="/dev/ui-kit06-data" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"06 · Data display & charts"}</__Link>
              <__Link href="/dev/ui-kit07-feedback" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>{"07 · Feedback & overlays"}</__Link>
              <__Link href="/dev/ui-kit08-commerce" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "#fff", color: "#0b1733", whiteSpace: "nowrap" }}>08 · Commerce components</__Link>
              <__Link href="/dev/ui-kit09-templates" style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", textDecoration: "none", background: "rgba(255,255,255,.08)", color: "rgba(226,232,240,.85)", whiteSpace: "nowrap" }}>09 · Page templates</__Link>
            </div>
          </header>
          <section className="ksec" id="s81">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">8.1</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Products</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>How a product shows up across lists, forms and POS.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Product row</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "linear-gradient(160deg,#b45309,#0f172a)", flexShrink: "0", color: "#fff", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Sunscreen SPF50 50ml</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span className="mono">S-1040</span> · Skin care › Sunscreen</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳580</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "#047857" }}>84 in stock</div>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "#eef1f6" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "linear-gradient(160deg,#1d4ed8,#0f172a)", flexShrink: "0", color: "#fff", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Galaxy A55 5G · 256 GB</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span className="mono">PH-A55-256</span> · Electronics › Phones</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳44,000</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "#047857" }}>12 in stock</div>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">thumb 48 · radius 12</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Price & money"}</span>
                  <span className="ktag" style={{ background: "#e0f2fe", color: "#075985" }}>BDT</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>৳580</span>
                      <span className="tn" style={{ fontSize: "var(--text-sm-plus)", color: "var(--text-muted)", textDecoration: "line-through" }}>৳720</span>
                      <span className="dl" style={{ background: "#ffece6", color: "#be123c" }}>−19%</span>
                    </div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>MRP ৳720 · you save ৳140 · VAT included</div>
                    <div className="tn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Amounts: <b>৳1,02,400</b> (Indian grouping) · <b>৳1.02L</b> short · <b>−৳1,240</b> loss</div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">bdt(n)</code>
                  {" "}
                  <code className="kcode">৳ + Indian grouping</code>
                  {" "}
                  <code className="kcode">tabular figures</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Stock level</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                      <span style={{ width: "110px", fontWeight: "var(--weight-medium)" }}>In stock</span>
                      <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                        <div style={{ width: "80%", height: "100%", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                      </div>
                      <span className="tn" style={{ width: "60px", textAlign: "right", color: "var(--text-muted)" }}>84</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#f59e0b" }} />
                      <span style={{ width: "110px", fontWeight: "var(--weight-medium)" }}>Low stock</span>
                      <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                        <div style={{ width: "15%", height: "100%", borderRadius: "var(--radius-full)", background: "#f59e0b" }} />
                      </div>
                      <span className="tn" style={{ width: "60px", textAlign: "right", color: "var(--text-muted)" }}>4 left</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#e11d48" }} />
                      <span style={{ width: "110px", fontWeight: "var(--weight-medium)" }}>Out of stock</span>
                      <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                        <div style={{ width: "0%", height: "100%", borderRadius: "var(--radius-full)", background: "#e11d48" }} />
                      </div>
                      <span className="tn" style={{ width: "60px", textAlign: "right", color: "var(--text-muted)" }}>0</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#7c3aed" }} />
                      <span style={{ width: "110px", fontWeight: "var(--weight-medium)" }}>Pre-order</span>
                      <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                        <div style={{ width: "30%", height: "100%", borderRadius: "var(--radius-full)", background: "#7c3aed" }} />
                      </div>
                      <span className="tn" style={{ width: "60px", textAlign: "right", color: "var(--text-muted)" }}>ships 5 Oct</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Variant picker</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <span className="lbl">Colour · Phantom Black</span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "#111827", boxShadow: "0 0 0 2px #fff, 0 0 0 4px #003087" }} />
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "#cbd5e1", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.12)" }} />
                        <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "#1e3a8a", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.12)" }} />
                      </div>
                    </div>
                    <div>
                      <span className="lbl">Storage</span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                        <span style={{ height: "38px", padding: "0 14px", borderRadius: "var(--radius-lg)", border: "1.5px solid #e2e8f0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#334155", background: "#fff" }}>128 GB</span>
                        <span style={{ height: "38px", padding: "0 14px", borderRadius: "var(--radius-lg)", border: "1.5px solid #003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#003087", background: "#f5f8ff" }}>256 GB</span>
                        <span style={{ height: "38px", padding: "0 14px", borderRadius: "var(--radius-lg)", border: "1.5px solid #e2e8f0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", color: "#cbd5e1", background: "#fff", textDecoration: "line-through" }}>512 GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Batches & expiry"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="mono" style={{ width: "70px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>B-0912</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                          <div style={{ width: "77%", height: "100%", borderRadius: "var(--radius-full)", background: "#0a5bd0" }} />
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "#0a5bd0", fontWeight: "var(--weight-medium)", marginTop: "3px" }}>23 days left · expires 12 Oct</div>
                      </div>
                      <span className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>84 pcs</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="mono" style={{ width: "70px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>B-0822</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                          <div style={{ width: "10%", height: "100%", borderRadius: "var(--radius-full)", background: "#e11d48" }} />
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "#e11d48", fontWeight: "var(--weight-medium)", marginTop: "3px" }}>3 days left · sell first</div>
                      </div>
                      <span className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>18 pcs</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="mono" style={{ width: "70px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>B-0810</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef1f6" }}>
                          <div style={{ width: "0%", height: "100%", borderRadius: "var(--radius-full)", background: "#e11d48" }} />
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "#be123c", fontWeight: "var(--weight-medium)", marginTop: "3px" }}>Expired 9 days ago</div>
                      </div>
                      <span className="tn" style={{ fontSize: "var(--text-xs-plus)" }}>9 pcs</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> food, medicine, cosmetics.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Barcode label</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ width: "240px", margin: "0 auto", padding: "12px", border: "1px dashed #94a3b8", borderRadius: "var(--radius-lg)", textAlign: "center", background: "#fff" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>Sunscreen SPF50 50ml</div>
                    <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
                      <svg width="200" height="46" viewBox="0 0 200 46" aria-hidden="true">
                        <rect x="0" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="4" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="7" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="11" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="16" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="20" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="23" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="27" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="29" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="34" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="39" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="43" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="47" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="49" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="53" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="57" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="61" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="65" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="68" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="71" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="76" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="81" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="86" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="91" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="94" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="96" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="98" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="101" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="104" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="109" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="114" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="119" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="123" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="127" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="130" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="132" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="136" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="140" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="145" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="150" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="153" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="157" y="0" width="3" height="46" fill="#0f172a" />
                        <rect x="163" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="166" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="168" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="172" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="175" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="178" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="180" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="183" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="186" y="0" width="1" height="46" fill="#0f172a" />
                        <rect x="190" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="193" y="0" width="2" height="46" fill="#0f172a" />
                        <rect x="198" y="0" width="1" height="46" fill="#0f172a" />
                      </svg>
                    </div>
                    <div className="mono" style={{ fontSize: "var(--text-xs)" }}>8941100500235</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>৳580</div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">50 × 30 mm</code>
                  {" "}
                  <code className="kcode">EAN-13</code>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s82">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">8.2</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Orders, payment and delivery</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }} />
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Order tracker</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", position: "relative" }}>
                      <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Placed</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>16 Sep</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", position: "relative" }}>
                      <span style={{ position: "absolute", top: "13px", left: "-50%", right: "50%", height: "2px", background: "#10b981" }} />
                      <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Confirmed</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>16 Sep</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", position: "relative" }}>
                      <span style={{ position: "absolute", top: "13px", left: "-50%", right: "50%", height: "2px", background: "#10b981" }} />
                      <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Packed</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>17 Sep</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", position: "relative" }}>
                      <span style={{ position: "absolute", top: "13px", left: "-50%", right: "50%", height: "2px", background: "#10b981" }} />
                      <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff" }}>4</span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Out for delivery</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Today</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px", position: "relative" }}>
                      <span style={{ position: "absolute", top: "13px", left: "-50%", right: "50%", height: "2px", background: "#e2e8f0" }} />
                      <span style={{ position: "relative", width: "28px", height: "28px", borderRadius: "var(--radius-full)", background: "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px #fff" }}>5</span>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Delivered</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">done green · now navy · next grey</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Order card</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ border: "1px solid #e6eaf0", borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mono" style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm-plus)" }}>GC-24817</span>
                      <span className="badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>Shipped</span>
                      <span className="badge" style={{ background: "#fef9c3", color: "#854d0e" }}>COD</span>
                      <span style={{ flexGrow: "1" }} />
                      <span className="tn" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>৳1,290</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "linear-gradient(160deg,#b45309,#0f172a)", flexShrink: "0", color: "#fff", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "linear-gradient(160deg,#475569,#0f172a)", flexShrink: "0", color: "#fff", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>+1</span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                      <span>Rahima K. · 017••••4521</span>
                      <span>Dhanmondi, Dhaka</span>
                      <span>Pathao · PTH-88120</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Cart / bill summary</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-sm)" }}>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Subtotal</span>
                      <span className="tn" style={{ color: "#0f172a" }}>৳1,160</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Coupon EID20</span>
                      <span className="tn" style={{ color: "#047857" }}>−৳116</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Delivery · Dhaka</span>
                      <span className="tn" style={{ color: "#0f172a" }}>৳60</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Points used · 200</span>
                      <span className="tn" style={{ color: "#047857" }}>−৳20</span>
                    </div>
                    <div style={{ display: "flex", paddingTop: "8px", borderTop: "1px dashed #cbd5e1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>
                      <span style={{ flexGrow: "1" }}>To pay</span>
                      <span className="tn">৳1,084</span>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Cash on delivery · Earns 54 points</div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Payment methods</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-xl)", border: "1.5px solid #003087", background: "#f5f8ff" }}>
                      <span style={{ width: "34px", height: "24px", borderRadius: "var(--radius-md)", background: "#e2136e", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>bK</span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>bKash</span>
                      <span style={{ color: "#003087" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-xl)", border: "1.5px solid #e2e8f0", background: "#fff" }}>
                      <span style={{ width: "34px", height: "24px", borderRadius: "var(--radius-md)", background: "#f7941d", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>N</span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Nagad</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-xl)", border: "1.5px solid #e2e8f0", background: "#fff" }}>
                      <span style={{ width: "34px", height: "24px", borderRadius: "var(--radius-md)", background: "#854d0e", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>৳</span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Cash on delivery</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "var(--radius-xl)", border: "1.5px solid #e2e8f0", background: "#fff" }}>
                      <span style={{ width: "34px", height: "24px", borderRadius: "var(--radius-md)", background: "#3730a3", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>VISA</span>
                      <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Card</span>
                    </div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> checkout, POS, payouts.</span>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Courier choice</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0" }}>
                      <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#e11d48", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>PA</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Pathao</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Next day · Dhaka</div>
                      </div>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳60</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0" }}>
                      <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#0f766e", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>SF</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Steadfast</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2–3 days · all BD</div>
                      </div>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳110</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0" }}>
                      <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#1d4ed8", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>RX</span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>RedX</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2 days · outside Dhaka</div>
                      </div>
                      <span className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>৳120</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s83">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">8.3</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Customers, loyalty and messages</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }} />
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Customer card</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "var(--radius-xl)", border: "1px solid #e6eaf0" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)", background: "#fce7f3", color: "#9d174d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-semibold)" }}>RK</span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <b>Rahima K.</b>
                        <span className="badge t-plat">Platinum</span>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>14 orders · ৳48,210 · last order 16 Sep</div>
                    </div>
                    <span className="ib" style={{ background: "#f1f5f9" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="ib" style={{ background: "#dcfce7", color: "#166534" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Addresses · default & other"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", border: "1.5px solid #003087", background: "#f5f8ff", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <b style={{ fontSize: "var(--text-sm)" }}>Home · default</b>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", lineHeight: "18px" }}>House 42, Road 27, Dhanmondi, Dhaka 1209</div>
                    </div>
                    <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <b style={{ fontSize: "var(--text-sm)" }}>Office</b>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", lineHeight: "18px" }}>Level 5, Gulshan Avenue, Dhaka 1212</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Points & tier"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ padding: "16px", borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg,#0b1733,#1e3a8a)", color: "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="ey ey-d" style={{ flexGrow: "1" }}>Gold member</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                          <path d="M5 21h14" />
                        </svg>
                      </div>
                      <div className="tn" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", marginTop: "6px" }}>2,480 pts</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.8)" }}>= ৳248 · 520 pts to Platinum</div>
                      <div style={{ height: "5px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.15)", marginTop: "8px" }}>
                        <div style={{ width: "80%", height: "100%", borderRadius: "var(--radius-full)", background: "#fbbf24" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="dl" style={{ background: "#fef9c3", color: "#854d0e" }}>+54 pts</span>
                      <span className="dl" style={{ background: "#e7f8f1", color: "#047857" }}>৳120 wallet</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>Coupon ticket</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "110px", background: "#003087", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px" }}>
                      <span className="tn" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)" }}>20%</span>
                      <span style={{ fontSize: "var(--text-xs)", opacity: ".8" }}>OFF</span>
                    </div>
                    <div style={{ flexGrow: "1", padding: "14px", borderLeft: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="mono" style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-label)" }}>EID20</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Min ৳1,000 · bKash only · till 30 Sep</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "#047857", fontWeight: "var(--weight-medium)" }}>212 of 500 used</span>
                    </div>
                  </div>
                  <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#0b1733", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", display: "flex", gap: "8px", alignItems: "center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  <path d="m9 12 2 2 4-4" />
</svg>WARRANTY CARD</div>
                    <div style={{ padding: "14px", fontSize: "var(--text-xs-plus)", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <b style={{ fontSize: "var(--text-sm)" }}>Galaxy A55 5G · 8/256 GB</b>
                      <span className="mono" style={{ color: "#475569" }}>IMEI 350912118845201</span>
                      <span>19 Sep 2026 → <b>19 Sep 2027</b></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Ratings & reviews"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--text-warning)", letterSpacing: "2px", fontSize: "var(--text-lg)" }}>★★★★<span style={{ color: "#e2e8f0" }}>★</span></span>
                      <b className="tn">4.3</b>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>(128 reviews)</span>
                    </div>
                    <div style={{ padding: "12px", borderRadius: "var(--radius-xl)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", lineHeight: "19px" }}>
                      <b>Nabila S.</b>
                      {" "}
                      <span className="badge b-received" style={{ height: "20px", fontSize: "var(--text-2xs)" }}>Verified buyer</span>
                      <div style={{ marginTop: "4px" }}>Light and no white cast. Good for Dhaka heat.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{"Messages · WhatsApp & SMS"}</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#e5ddd5", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ alignSelf: "flex-start", maxWidth: "85%", padding: "10px 12px", borderRadius: "var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)", background: "#fff", fontSize: "var(--text-xs-plus)", lineHeight: "19px" }}>Hi Rahima, your order <b>GC-24817</b> is on the way with Pathao. Track: gsh.bd/t/88120<div style={{ textAlign: "right", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>10:42 AM</div></div>
                    <div style={{ alignSelf: "flex-end", maxWidth: "70%", padding: "10px 12px", borderRadius: "var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)", background: "#dcf8c6", fontSize: "var(--text-xs-plus)" }}>Thank you! <span className="bn">ধন্যবাদ</span></div>
                  </div>
                  <div style={{ padding: "12px", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)" }}>
                    <span className="klbl">SMS · 142 / 160 characters</span>
                    <div style={{ marginTop: "6px" }}>GridShop: Order GC-24817 on the way. Pay ৳1,084 on delivery. Help: 09612-XX0000</div>
                  </div>
                </div>
                <div className="kspec-f">
                  <span style={{ color: "#475569" }}><b style={{ color: "#0f172a" }}>Use when</b> previewing any message before it is sent.</span>
                </div>
              </div>
            </div>
          </section>
          <section className="ksec" id="s84">
            <div className="ksh">
              <div style={{ flexGrow: "1" }}>
                <div className="knum">8.4</div>
                <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Printouts</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", maxWidth: "820px" }}>What leaves the shop on paper.</p>
              </div>
            </div>
            <div className="kgrid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
              <div className="kspec" style={{ gridColumn: "span 1" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>POS receipt · 80 mm</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ width: "260px", margin: "0 auto", padding: "16px", background: "#fff", boxShadow: "0 10px 30px -14px rgba(15,23,42,.35)", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "#0f172a", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ textAlign: "center", fontFamily: "var(--font-sans)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>GridShop</div>
                    <div style={{ textAlign: "center" }}>Dhanmondi · 01712-XX4410</div>
                    <div style={{ textAlign: "center" }}>Receipt R-DH1-00831 · 19 Sep 2026 10:12</div>
                    <div style={{ borderTop: "1px dashed #94a3b8", margin: "6px 0" }} />
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1" }}>Sunscreen SPF50 ×2</span>
                      <span>1,160.00</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1" }}>Toner 150ml ×1</span>
                      <span>690.00</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1" }}>Discount</span>
                      <span>−100.00</span>
                    </div>
                    <div style={{ borderTop: "1px dashed #94a3b8", margin: "6px 0" }} />
                    <div style={{ display: "flex", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs-plus)" }}>
                      <span style={{ flexGrow: "1" }}>TOTAL ৳</span>
                      <span>1,750.00</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <span style={{ flexGrow: "1" }}>bKash</span>
                      <span>1,750.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "6px" }}>
                      <svg width="200" height="30" viewBox="0 0 200 30" aria-hidden="true">
                        <rect x="0" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="5" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="8" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="10" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="14" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="18" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="23" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="26" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="31" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="35" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="40" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="43" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="48" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="50" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="52" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="54" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="59" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="62" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="66" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="68" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="72" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="77" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="80" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="83" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="86" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="88" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="92" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="95" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="99" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="101" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="104" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="108" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="111" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="115" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="117" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="119" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="121" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="124" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="127" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="131" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="134" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="137" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="140" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="144" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="150" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="152" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="155" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="158" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="163" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="166" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="172" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="174" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="179" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="181" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="186" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="189" y="0" width="3" height="30" fill="#0f172a" />
                        <rect x="195" y="0" width="2" height="30" fill="#0f172a" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>Cashier: Sadia · Thank you!</div>
                  </div>
                </div>
                <div className="kspec-f">
                  <code className="kcode">monospace</code>
                  {" "}
                  <code className="kcode">print.css</code>
                </div>
              </div>
              <div className="kspec" style={{ gridColumn: "span 2" }}>
                <div className="kspec-h">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>A4 invoice</span>
                </div>
                <div className="kspec-b" style={{ padding: "22px", background: "#fff" }}>
                  <div style={{ padding: "20px", background: "#fff", boxShadow: "0 10px 30px -14px rgba(15,23,42,.35)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="" style={{ height: "22px" }} />
                      <span style={{ flexGrow: "1" }} />
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>INVOICE</div>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>INV-24817</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "var(--text-xs)", color: "#475569" }}>
                      <div><b style={{ color: "#0f172a" }}>Bill to</b><br />Rahima K.<br />Dhanmondi, Dhaka</div>
                      <div style={{ textAlign: "right" }}><b style={{ color: "#0f172a" }}>Date</b><br />16 Sep 2026<br />COD</div>
                    </div>
                    <table className="tb" style={{ fontSize: "var(--text-xs)" }}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th className="r">Qty</th>
                          <th className="r">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Sunscreen SPF50 50ml</td>
                          <td className="r">2</td>
                          <td className="r tn">৳1,160</td>
                        </tr>
                        <tr>
                          <td>Delivery</td>
                          <td className="r">1</td>
                          <td className="r tn">৳60</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "flex-end", fontWeight: "var(--weight-semibold)" }}>Total ৳1,084</div>
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
