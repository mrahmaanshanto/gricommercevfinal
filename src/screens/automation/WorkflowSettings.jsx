'use client';
// Generated from design/templates/automation/WorkflowSettings.dc.html by scripts/convert-design.mjs.
// Workflow settings — Automation — workflow settings: quiet hours, spending limits, approvals, role permissions, senders and failure handling.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : '#64748b', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

var ROLES = ['Manager', 'Order team', 'Marketing', 'Branch staff'];
var DEF = { Manager: [1, 1, 1], 'Order team': [1, 1, 0], Marketing: [1, 1, 1], 'Branch staff': [1, 0, 0] };
function hh(n) { var ap = n >= 12 ? 'pm' : 'am'; return (n % 12 || 12) + ' ' + ap; }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var perm = s.perm || {};
    var qf = stepN(self, 'qFrom', 21, 1, 18, 23), qt = stepN(self, 'qTo', 9, 1, 6, 11);
    var v = {
      headline: 'Quiet ' + hh(qf.v) + ' to ' + hh(qt.v) + ' · daily limit ৳' + Number(s.cap == null ? 500 : s.cap || 0).toLocaleString('en-IN'),
      qFrom: assign(qf, { v: hh(qf.v) }), qTo: assign(qt, { v: hh(qt.v) }), qFriday: mkSw(self, 'qFriday', true),
      cap: s.cap == null ? '500' : s.cap, on_cap: function (e) { self.setState({ cap: String(val(e) || '').replace(/\D/g, '') }); },
      perCust: stepN(self, 'perCust', 2, 1, 1, 5),
      apBulk: mkSw(self, 'apBulk', true), apRefund: mkSw(self, 'apRefund', true), apTransfer: mkSw(self, 'apTransfer', true),
      roles: ROLES.map(function (r) { var p = perm[r] || DEF[r]; return { n: r, c: ['See runs', 'Turn rules on or off', 'Build workflows'].map(function (lab, i) { var on = !!p[i]; return { on: on, cls: on ? 'sw on' : 'sw', aria: r + ': ' + lab, toggle: function () { var n = assign({}, perm); var q = p.slice(); q[i] = on ? 0 : 1; n[r] = q; self.setState({ perm: n }); } }; }) }; }),
      senders: [{ l: 'SMS name', v: 'GridShop', s: 'Approved' }, { l: 'WhatsApp', v: '+880 1711-482093', s: 'Verified business' }, { l: 'Email', v: 'hello@gridshop.com.bd', s: 'Verified' }],
      retry: stepN(self, 'retry', 3, 1, 0, 5), pauseAfter: stepN(self, 'pauseAfter', 10, 5, 5, 50), failNotify: mkSw(self, 'failNotify', true)
    };
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

.sec{display:flex;flex-direction:column;gap:14px;padding:20px 22px}
.h2{margin:0;font-size:15.5px;line-height:22px;font-weight:600;color:#0f172a;letter-spacing:-.01em}
.sub{margin:2px 0 0;font-size:12.5px;line-height:18px;color:#64748b}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chk{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #f1f4f8}
.chk:last-child{border-bottom:0}
.pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:999px;background:#f1f4f9;font-size:12px;color:#334155;white-space:nowrap}
.amt{height:40px;padding:0 16px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:14px;font-weight:600;color:#1e293b;cursor:pointer;font-variant-numeric:tabular-nums}
.amt.on{border-color:#003087;background:rgba(0,48,135,.06);color:#003087}
.amt:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.stp2{display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;height:40px}
.stp2 button{width:38px;height:100%;border:0;background:#f8fafc;font:inherit;font-size:16px;cursor:pointer;color:#334155}
.stp2 span{min-width:64px;text-align:center;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:10px;background:#0b1733;color:#cbd8ee;font-size:12px;line-height:18px;white-space:pre-wrap}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
`;

// ---- markup ----

export default class WorkflowSettingsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WorkflowSettings">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1350px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="auto-settings" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Automation" page="Workflow settings" placeholder="Search" />
            <div className="pgc" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">Automation · Workflow settings</div>
                    <h2 style={{ margin: "6px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.025em" }}>{v.headline}</h2>
                    <p style={{ margin: "6px 0 0", fontSize: "13.5px", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>Limits and permissions that apply to every rule and workflow, so automation never spams customers or spends more than planned.</p>
                  </div>
                  <__Link href="/automations" className="btn sm" style={{ background: "#fff", color: "#0b1733", height: "38px", flexShrink: "0" }}>Rules</__Link>
                </div>
              </section>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Quiet hours</h2>
                      <p className="sub">No customer messages or calls in this window. They wait and go out when it ends. Dhaka time.</p>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Quiet from</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Less" onClick={v.qFrom?.dec}>−</button>
                            <span>{v.qFrom?.v}</span>
                            <button type="button" aria-label="More" onClick={v.qFrom?.inc}>+</button>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Until</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Less" onClick={v.qTo?.dec}>−</button>
                            <span>{v.qTo?.v}</span>
                            <button type="button" aria-label="More" onClick={v.qTo?.inc}>+</button>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b" }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "12px" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Quieter on Friday prayers</div>
                          <div style={{ fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>No messages 12:30 to 2:30 pm on Fridays.</div>
                        </div>
                        <button type="button" className={v.qFriday?.cls} role="switch" aria-checked={v.qFriday?.on} aria-label="Quieter on Friday prayers" onClick={v.qFriday?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Spending limits</h2>
                      <p className="sub">Charged from the wallet. Rules pause when a limit is reached and resume the next day.</p>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label className="lbl" htmlFor="cap">Daily limit for all automation</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>৳</span>
                          <input id="cap" className="inp" inputMode="numeric" value={v.cap} onChange={v.on_cap} style={{ paddingLeft: "32px" }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Today: ৳58 of the limit used.</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Messages per customer per day</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Less" onClick={v.perCust?.dec}>−</button>
                            <span>{v.perCust?.v}</span>
                            <button type="button" aria-label="More" onClick={v.perCust?.inc}>+</button>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>at most</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Needs approval first</h2>
                      <p className="sub">These wait for a manager to approve in the app.</p>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "12px" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Messages to more than 500 customers at once</div>
                          <div style={{ fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>Offers and announcements.</div>
                        </div>
                        <button type="button" className={v.apBulk?.cls} role="switch" aria-checked={v.apBulk?.on} aria-label="Messages to more than 500 customers at once" onClick={v.apBulk?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Refunds and wallet credits</div>
                          <div style={{ fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>Any amount.</div>
                        </div>
                        <button type="button" className={v.apRefund?.cls} role="switch" aria-checked={v.apRefund?.on} aria-label="Refunds and wallet credits" onClick={v.apRefund?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Stock transfers worth more than ৳50,000</div>
                          <div style={{ fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>Between warehouses and branches.</div>
                        </div>
                        <button type="button" className={v.apTransfer?.cls} role="switch" aria-checked={v.apTransfer?.on} aria-label="Stock transfers worth more than ৳50,000" onClick={v.apTransfer?.toggle} />
                      </div>
                    </div>
                  </section>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "18px 20px 12px" }}>
                      <h2 className="h2">Who can do what</h2>
                      <p className="sub">By staff role. The owner can always do everything.</p>
                    </div>
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Role</th>
                          <th style={{ textAlign: "center" }}>See runs</th>
                          <th style={{ textAlign: "center" }}>Turn rules on or off</th>
                          <th style={{ textAlign: "center" }}>Build workflows</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.roles).map((r, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ fontWeight: "600", color: "#0f172a" }}>{r?.n}</td>
                              {__list(r?.c).map((x, $index) => (<React.Fragment key={$index}>
                                  <td style={{ textAlign: "center" }}>
                                    <button type="button" className={x?.cls} role="switch" aria-checked={x?.on} aria-label={x?.aria} onClick={x?.toggle} />
                                  </td>
                                </React.Fragment>))}
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Sent from</h2>
                      <p className="sub">Customers see these names and numbers.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.senders).map((k, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f1f4f8", fontSize: "13px" }}>
                            <span style={{ color: "#64748b", width: "110px", flexShrink: "0" }}>{k?.l}</span>
                            <span style={{ flexGrow: "1", fontWeight: "600", color: "#0f172a" }}>{k?.v}</span>
                            <span className="badge" style={{ background: "#e7f8f1", color: "#047857" }}>{k?.s}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">When something fails</h2>
                      <p className="sub">Failed steps retry before anyone is told.</p>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Retries</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Less" onClick={v.retry?.dec}>−</button>
                            <span>{v.retry?.v}</span>
                            <button type="button" aria-label="More" onClick={v.retry?.inc}>+</button>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>times, 5 minutes apart</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Pause a rule after</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Less" onClick={v.pauseAfter?.dec}>−</button>
                            <span>{v.pauseAfter?.v}</span>
                            <button type="button" aria-label="More" onClick={v.pauseAfter?.inc}>+</button>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>failures in an hour</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "12px" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>Tell the owner in the app and by SMS</div>
                          <div style={{ fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>Once per rule per day.</div>
                        </div>
                        <button type="button" className={v.failNotify?.cls} role="switch" aria-checked={v.failNotify?.on} aria-label="Tell the owner in the app and by SMS" onClick={v.failNotify?.toggle} />
                      </div>
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>Run history is kept for 90 days.</span>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
