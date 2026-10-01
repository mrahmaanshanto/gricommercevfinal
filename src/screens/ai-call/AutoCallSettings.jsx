'use client';
// Generated from design/templates/ai-call/AutoCallSettings.dc.html by scripts/convert-design.mjs.
// AI auto-call settings — Orders — AI auto-call settings: triggers, calling hours, retries, voice, script and result statuses.
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
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

var OUT = [['Customer confirms', 'AI confirmed', '#e7f8f1', '#047857', 'Goes to To pack. Address changes are saved first.'],
  ['Customer cancels', 'Cancelled by customer', '#ffece6', '#b83210', 'Stock is released. The reason said on the call is saved.'],
  ['No answer after every try', 'No answer', '#fff4e0', '#a14f06', 'Stays unconfirmed. Staff can call or send an SMS.'],
  ['Number unreachable or wrong', 'Wrong number', '#ffece6', '#b83210', 'Flagged for the fraud check across couriers.'],
  ['Wants changes the AI cannot make', 'Needs a person', 'rgba(0,48,135,.08)', '#003087', 'Goes to the staff queue with the recording.'],
  ['Asks to be called later', 'Call back later', '#e0f2fe', '#075985', 'The AI calls again at the time the customer said.']];
var DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
var SRC = ['Website', 'Landing pages', 'Facebook', 'WhatsApp', 'Phone orders'];
function hh(n) { var ap = n >= 12 ? 'pm' : 'am'; var h = n % 12 || 12; return h + ' ' + ap; }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var mode = s.mode || 'auto', lang = s.lang || 'auto', voice = s.voice || 'female';
    var days = s.days || { Sat: 1, Sun: 1, Mon: 1, Tue: 1, Wed: 1, Thu: 1 }, srcs = s.srcs || { Website: 1, 'Landing pages': 1, Facebook: 1, WhatsApp: 1 };
    var from = stepN(self, 'from', 9, 1, 6, 12), to = stepN(self, 'to', 21, 1, 14, 23), tries = stepN(self, 'tries', 3, 1, 1, 5), gap = stepN(self, 'gap', 30, 10, 10, 120), delay = stepN(self, 'delay', 2, 1, 0, 60), speed = stepN(self, 'speed', 0.9, 0.1, 0.7, 1.3);
    var nd = Object.keys(days).length;
    var bn = lang !== 'en';
    var v = {
      headline: mode === 'off' ? 'AI auto-call is off' : mode === 'auto' ? 'Calling ' + (s.tCod === false ? 'new' : 'new COD') + ' orders ' + delay.v + ' min after they are placed' : 'Manual only · staff start each call',
      tiles: [{ l: 'Calls today', v: '8', s: '3 confirmed so far', c: '#34d399' }, { l: 'Needs a person', v: '1', s: 'waiting in the staff queue', c: '#60a5fa' }, { l: 'Fake orders stopped', v: '9', s: 'this week, before packing', c: '#fb7185' }, { l: 'Cost today', v: '৳34', s: 'from wallet · ৳2,340 left', c: '#fbbf24' }],
      mode: lseg(self, [['auto', 'Automatic'], ['manual', 'Manual only'], ['off', 'Off']], mode, 'mode'),
      modeNote: mode === 'auto' ? 'Staff can still start a call by hand from any order.' : mode === 'manual' ? 'An AI call button appears on each order and on the orders list. Nothing is called automatically.' : 'No calls are placed and nothing is charged.',
      isAuto: mode === 'auto',
      tPlaced: mkSw(self, 'tPlaced', true), tCod: mkSw(self, 'tCod', true), tRepeat: mkSw(self, 'tRepeat', true), tEdit: mkSw(self, 'tEdit', false),
      delay: delay, vmin: s.vmin == null ? '300' : s.vmin, vmax: s.vmax == null ? '' : s.vmax,
      onVmin: function (e) { self.setState({ vmin: String(val(e) || '').replace(/\D/g, '') }); }, onVmax: function (e) { self.setState({ vmax: String(val(e) || '').replace(/\D/g, '') }); },
      srcs: SRC.map(function (x) { var on = !!srcs[x]; return { l: x, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var n = assign({}, srcs); if (on) delete n[x]; else n[x] = 1; self.setState({ srcs: n }); } }; }),
      from: assign(from, { v: hh(from.v) }), to: assign(to, { v: hh(to.v) }), tries: tries, gap: gap,
      days: DAYS.map(function (d) { var on = !!days[d]; return { l: d, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var n = assign({}, days); if (on) delete n[d]; else n[d] = 1; self.setState({ days: n }); } }; }),
      hoursNote: 'Calls ' + hh((s.from || 9)) + ' to ' + hh((s.to || 21)) + ', ' + nd + ' days a week, Dhaka time. Up to ' + tries.v + ' tries, ' + gap.v + ' minutes apart.',
      lang: lseg(self, [['auto', 'Match customer'], ['bn', 'Bangla'], ['en', 'English']], lang, 'lang'),
      voice: lseg(self, [['female', 'Female'], ['male', 'Male']], voice, 'voice'),
      speed: assign(speed, { v: speed.v.toFixed(1) }),
      script: bn ? 'আসসালামু আলাইকুম {customer_name}, {store_name} থেকে বলছি।\nআপনি {items} অর্ডার করেছেন, মোট {total} টাকা, ক্যাশ অন ডেলিভারি।\nঠিকানা: {area}, {district}। অর্ডারটি কনফার্ম করবেন?' : 'Hello {customer_name}, this is {store_name}.\nYou ordered {items}, {total} taka, cash on delivery.\nDelivery to {area}, {district}. Shall we confirm the order?',
      askAddr: mkSw(self, 'askAddr', true), allowChange: mkSw(self, 'allowChange', true),
      outs: OUT.map(function (o) { return { r: o[0], st: o[1], bb: o[2], bf: o[3], d: o[4] }; }),
      notify: mkSw(self, 'notify', true),
      cost: [{ l: 'Per call, up to 1 minute', v: '৳4.00' }, { l: 'Each extra 30 seconds', v: '৳1.00' }, { l: 'Unanswered try', v: 'Free' }, { l: 'This month so far', v: '৳848 · 212 calls' }],
      tphone: s.tphone == null ? '01711-482093' : s.tphone, onTphone: function (e) { self.setState({ tphone: val(e) }); },
      testCall: function () { var p = String(s.tphone == null ? '01711-482093' : s.tphone).replace(/\D/g, ''); if (!/^01[3-9]\d{8}$/.test(p)) { toast(self, 'Enter a Bangladeshi mobile number, like 01711-482093.', true); return; } toast(self, 'Calling ' + p.slice(0, 5) + '-' + p.slice(5) + ' now with a sample order in ' + (lang === 'en' ? 'English' : 'Bangla') + '.'); }
    };
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
.hero{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:#0b1733;color:#fff;padding:24px 26px;--accent-text:#7fcff0;--text-success:#6ee7b7;--text-warning:#fcd34d;--text-danger:#fda4af;--text-info:#7dd3fc}
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

.sec{display:flex;flex-direction:column;gap:14px;padding:20px 22px}
.h2{margin:0;font-size:var(--text-base);line-height:22px;font-weight:var(--weight-semibold);color:#0f172a;letter-spacing:0}
.sub{margin:2px 0 0;font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chk{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #f1f4f8}
.chk:last-child{border-bottom:0}
.pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:var(--radius-full);background:#f1f4f9;font-size:var(--text-xs);color:#334155;white-space:nowrap}
.amt{height:36px;padding:0 16px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b;cursor:pointer;font-variant-numeric:tabular-nums}
.amt.on{border-color:#003087;background:rgba(0,48,135,.06);color:#003087}
.amt:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.stp2{display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:var(--radius-lg);overflow:hidden;height:40px}
.stp2 button{width:38px;height:100%;border:0;background:#f8fafc;font:inherit;font-size:var(--text-base);cursor:pointer;color:#334155}
.stp2 button{display:inline-flex;align-items:center;justify-content:center;padding:0}
.dc-screen .script{margin:0;padding:14px 16px;border-radius:var(--radius-lg);background:#0b1733;color:#e2e8f0;font-family:var(--font-bn);font-size:var(--text-sm-plus);line-height:24px;white-space:pre-wrap}
.stp2 span{min-width:64px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:#0b1733;color:#cbd8ee;font-size:var(--text-xs);line-height:18px;white-space:pre-wrap;--text-muted:#94a3b8}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}.lseg button{height:34px;padding:0 14px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
`;

// ---- markup ----

export default class AutoCallSettingsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AutoCallSettings">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="comm-ai" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Orders" page="AI auto-call settings" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">Orders · AI auto-call settings</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>The AI calls customers to confirm orders in Bangla or English, then moves each order to the right status. Calls are charged from the wallet.</p>
                  </div>
                  <__Link href="/ai-calls" className="btn sm" style={{ background: "#fff", color: "#0b1733", height: "38px", flexShrink: "0" }}>Call results</__Link>
                </div>
                <div className="st gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: var(--radius-full); background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.7)" }}>{ht?.s}</div>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">How calls start</h2>
                      <p className="sub">Automatic calls follow the triggers below. With manual only, staff press AI call on an order.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="lbl">Mode</span>
                      <div className="lseg" role="radiogroup" aria-label="Mode">
                        {__list(v.mode).map((m, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.modeNote}</span>
                  </section>
                  {v.isAuto ? (<>
                    <section className="tc sec">
                      <div>
                        <h2 className="h2">Triggers</h2>
                        <p className="sub">Every condition that is on must match before a call is placed.</p>
                      </div>
                      <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>When a new order is placed</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Website, landing pages, Facebook and WhatsApp orders. POS sales are never called.</div>
                          </div>
                          <button type="button" className={v.tPlaced?.cls} role="switch" aria-checked={v.tPlaced?.on} aria-label="When a new order is placed" onClick={v.tPlaced?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Cash on delivery orders only</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Prepaid bKash, Nagad and card orders are skipped.</div>
                          </div>
                          <button type="button" className={v.tCod?.cls} role="switch" aria-checked={v.tCod?.on} aria-label="Cash on delivery orders only" onClick={v.tCod?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Skip trusted repeat customers</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers with 3 or more delivered orders and no returns.</div>
                          </div>
                          <button type="button" className={v.tRepeat?.cls} role="switch" aria-checked={v.tRepeat?.on} aria-label="Skip trusted repeat customers" onClick={v.tRepeat?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Call again when a customer edits the order</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Phone, address or items changed after the first call.</div>
                          </div>
                          <button type="button" className={v.tEdit?.cls} role="switch" aria-checked={v.tEdit?.on} aria-label="Call again when a customer edits the order" onClick={v.tEdit?.toggle} />
                        </div>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="lbl">Wait after the order</span>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                            <div className="stp2">
                              <button type="button" aria-label="Decrease wait after the order" onClick={v.delay?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                              <span>{v.delay?.v}</span>
                              <button type="button" aria-label="Increase wait after the order" onClick={v.delay?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                            </div>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>minutes</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label className="lbl" htmlFor="vmin">Order value from</label>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>৳</span>
                            <input id="vmin" className="inp" inputMode="numeric" value={v.vmin} onChange={v.onVmin} style={{ paddingLeft: "32px" }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label className="lbl" htmlFor="vmax">Up to</label>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>৳</span>
                            <input id="vmax" className="inp" inputMode="numeric" value={v.vmax} onChange={v.onVmax} style={{ paddingLeft: "32px" }} placeholder="No limit" />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Order sources</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {__list(v.srcs).map((c, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </section>
                  </>) : null}
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Calling hours and retries</h2>
                      <p className="sub">Orders outside calling hours wait for the next morning.</p>
                    </div>
                    <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Start calling</span>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Decrease calling hours start" onClick={v.from?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                            <span>{v.from?.v}</span>
                            <button type="button" aria-label="Increase calling hours start" onClick={v.from?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Stop calling</span>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Decrease calling hours end" onClick={v.to?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                            <span>{v.to?.v}</span>
                            <button type="button" aria-label="Increase calling hours end" onClick={v.to?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Tries if no answer</span>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Decrease number of tries" onClick={v.tries?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                            <span>{v.tries?.v}</span>
                            <button type="button" aria-label="Increase number of tries" onClick={v.tries?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>calls</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Time between tries</span>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Decrease gap between tries" onClick={v.gap?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                            <span>{v.gap?.v}</span>
                            <button type="button" aria-label="Increase gap between tries" onClick={v.gap?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>minutes</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.days).map((d, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={d?.cls} aria-pressed={d?.on} onClick={d?.pick}>{d?.l}</button>
                        </React.Fragment>))}
                    </div>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.hoursNote}</span>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Voice and script</h2>
                      <p className="sub">What the AI says. Words in braces are filled from the order.</p>
                    </div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Language</span>
                        <div className="lseg" role="radiogroup" aria-label="Language">
                          {__list(v.lang).map((m, $index) => (<React.Fragment key={$index}>
                              <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Voice</span>
                        <div className="lseg" role="radiogroup" aria-label="Voice">
                          {__list(v.voice).map((m, $index) => (<React.Fragment key={$index}>
                              <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span className="lbl">Speaking speed</span>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                          <div className="stp2">
                            <button type="button" aria-label="Decrease speaking speed" onClick={v.speed?.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                            <span>{v.speed?.v}</span>
                            <button type="button" aria-label="Increase speaking speed" onClick={v.speed?.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>× normal</span>
                        </div>
                      </div>
                    </div>
                    <div className="script" role="group" aria-label="Call script" style={{ fontFamily: "var(--font-bn)" }}>{v.script}</div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Confirm the delivery address</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Reads back area and district, and asks for a landmark if missing.</div>
                        </div>
                        <button type="button" className={v.askAddr?.cls} role="switch" aria-checked={v.askAddr?.on} aria-label="Confirm the delivery address" onClick={v.askAddr?.toggle} />
                      </div>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Let the customer change quantity or size</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Changes are saved on the order and the total is read back.</div>
                        </div>
                        <button type="button" className={v.allowChange?.cls} role="switch" aria-checked={v.allowChange?.on} aria-label="Let the customer change quantity or size" onClick={v.allowChange?.toggle} />
                      </div>
                    </div>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">What each result does</h2>
                      <p className="sub">The order moves to this status after the call.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {__list(v.outs).map((o, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "10px 0", borderBottom: "1px solid #f1f4f8" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{o?.r}</span>
                              <span className="badge" style={__sx(`background: ${o?.bb ?? ""}; color: ${o?.bf ?? ""};`)}>{o?.st}</span>
                            </div>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{o?.d}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Needs a person</h2>
                      <p className="sub">Unclear calls go to a staff queue instead of guessing.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label className="lbl" htmlFor="team">Send to</label>
                      <select id="team" className="sel">
                        <option>Order confirmation team (3 staff)</option>
                        <option>Dhanmondi branch manager</option>
                        <option>Store owner</option>
                      </select>
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Notify in the app and by SMS</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Within a minute of the call ending.</div>
                        </div>
                        <button type="button" className={v.notify?.cls} role="switch" aria-checked={v.notify?.on} aria-label="Notify in the app and by SMS" onClick={v.notify?.toggle} />
                      </div>
                    </div>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Cost</h2>
                      <p className="sub">Charged from the wallet per call.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.cost).map((k, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{k?.l}</span>
                            <span className="tn" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{k?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <__Link href="/credit-wallet" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{"Wallet & credits"}</__Link>
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Test call</h2>
                      <p className="sub">Calls this number now with a sample order.</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input className="inp mono" aria-label="Phone number" value={v.tphone} onChange={v.onTphone} />
                      <button type="button" className="btn solid sm" style={{ height: "44px" }} onClick={v.testCall}>Call me</button>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
