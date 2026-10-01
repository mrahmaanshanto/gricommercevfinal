'use client';
// Generated from design/templates/billing/Subscription.dc.html by scripts/convert-design.mjs.
// Subscription & billing — Settings — plan, modules with trial and validity, billing history and renewal.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { PaymentLogo } from '@/components/PaymentLogo';
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

var TODAY = new Date(2026, 8, 29);
// name, desc, status, activated, trialUsed, validUntil (y,m,d) or null, price
var MODS = [
  ['Core store', 'Orders, products, customers, storefront', 'active', '12 Mar 2026', 14, [2026, 10, 12], 0],
  ['POS register', '2 counters', 'active', '20 Mar 2026', 14, [2026, 10, 12], 500],
  ['Purchase & stock', 'POs, warehouses, transfers', 'active', '12 Mar 2026', 14, [2026, 10, 12], 400],
  ['Staff & HR', 'Attendance, leave, payroll', 'active', '2 Jun 2026', 14, [2026, 10, 12], 400],
  ['Tracking & analytics', 'Pixels, server events, reports', 'active', '18 Jul 2026', 14, [2026, 10, 12], 600],
  ['Loyalty & promo', 'Points, wallet, coupons', 'active', '1 Aug 2026', 14, [2026, 10, 12], 300],
  ['Cart recovery', 'Abandoned carts, reminders', 'active', '1 Aug 2026', 14, [2026, 10, 12], 300],
  ['AI auto-call', 'Calls charged from the wallet', 'trial', '20 Sep 2026', 9, [2026, 10, 4], 500],
  ['WordPress sync', 'Two-way WooCommerce sync', 'trial', '24 Sep 2026', 5, [2026, 10, 8], 400],
  ['Communication', 'Posting scheduler and calendar', 'trial', '27 Sep 2026', 2, [2026, 10, 11], 500],
  ['Accounts', 'Chart of accounts, journals', 'off', '—', 0, null, 600],
  ['Automation', 'Rules and workflow builder', 'trial', '29 Sep 2026', 0, [2026, 10, 13], 400],
  ['GridAI', 'Chat and voice assistant', 'trial', '29 Sep 2026', 0, [2026, 10, 13], 800]
];
var ST = { active: ['Active', '#e7f8f1', '#047857'], trial: ['Trial', '#e0f2fe', '#075985'], off: ['Not started', '#f1f5f9', '#475569'], cancel: ['Ends at renewal', '#fff4e0', '#a14f06'] };
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var INV = [['GC-2609-0412', '12 Sep 2026', 'Sep 12 – Oct 11 · 7 modules', 'Visa ·· 4417', 2500, 'Paid'], ['GC-2608-0388', '12 Aug 2026', 'Aug 12 – Sep 11 · 7 modules', 'Visa ·· 4417', 2500, 'Paid'], ['GC-2608-0301', '1 Aug 2026', 'Loyalty & promo, Cart recovery · part month', 'bKash', 435, 'Paid'], ['GC-2607-0277', '12 Jul 2026', 'Jul 12 – Aug 11 · 5 modules', 'bKash', 1900, 'Paid'], ['GC-2606-0240', '12 Jun 2026', 'Jun 12 – Jul 11 · 4 modules', 'Nagad', 1300, 'Paid'], ['GC-2605-0198', '12 May 2026', 'May 12 – Jun 11 · 3 modules', 'bKash', 900, 'Refunded ৳200']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var over = s.over || {}, f = s.f || 'all';
    var rows = MODS.map(function (m) { var st = over[m[0]] || m[2]; return { m: m, st: st }; });
    var active = rows.filter(function (r) { return r.st === 'active' || r.st === 'cancel'; });
    var total = active.reduce(function (a, r) { return a + r.m[6]; }, 0) + 0;
    var trialsEndingSoon = rows.filter(function (r) { return r.st === 'trial'; }).length;
    var v = {
      headline: 'Growth plan · renews 12 Oct 2026',
      tiles: [
        { l: 'Active modules', v: String(active.length), s: 'plus ' + trialsEndingSoon + ' on trial', c: '#34d399' },
        { l: 'Next renewal', v: '13 days', s: '12 Oct 2026 · ' + bdt(total), c: '#60a5fa' },
        { l: 'Trials running', v: String(trialsEndingSoon), s: 'first one ends 4 Oct', c: '#fbbf24' },
        { l: 'Paid this year', v: bdt(9535), s: '6 invoices since March', c: '#a78bfa' }
      ],
      segs: lseg(self, [['all', 'All'], ['active', 'Active'], ['trial', 'Trial'], ['off', 'Not started']], f, 'f'),
      mods: rows.filter(function (r) { return f === 'all' || r.st === f || (f === 'active' && r.st === 'cancel'); }).map(function (r) {
        var m = r.m.slice(), st = r.st, b = ST[st];
        if (m[2] === 'off' && st === 'trial') { m[3] = '29 Sep 2026'; m[4] = 0; m[5] = [2026, 10, 13]; }
        if (m[2] === 'trial' && st === 'active') { m[5] = [2026, 10, 12]; }
        var until = m[5] ? new Date(m[5][0], m[5][1] - 1, m[5][2]) : null;
        var left = until ? Math.round((until - TODAY) / 86400000) : null;
        var trialOnly = st === 'trial';
        return { n: m[0], d: m[1], st: b[0], bb: b[1], bf: b[2], act: m[3],
          tw: (m[4] / 14 * 100) + '%', tc: m[4] >= 14 ? '#94a3b8' : '#003087', tl: st === 'off' ? 'Not used' : m[4] + ' of 14 days',
          until: until ? until.getDate() + ' ' + MON[until.getMonth()] + ' ' + until.getFullYear() : '—',
          left: left == null ? '' : trialOnly ? left + ' trial days left' : left + ' days left', lc: trialOnly && left <= 7 ? '#b45309' : '#64748b',
          p: m[6] ? bdt(m[6]) : 'Included',
          btn: st === 'off' ? 'Start trial' : st === 'trial' ? 'Activate' : st === 'cancel' ? 'Keep' : m[6] ? 'Cancel' : '—',
          bcls: st === 'off' || st === 'trial' ? 'btn solid sm' : 'abtn',
          act2: function () {
            var n = assign({}, over);
            if (st === 'off') { n[m[0]] = 'trial'; toast(self, m[0] + ' trial started. 14 days free, no charge until you activate.'); }
            else if (st === 'trial') { n[m[0]] = 'active'; toast(self, m[0] + ' activated. ' + bdt(m[6]) + ' is added to the 12 Oct renewal.'); }
            else if (st === 'cancel') { n[m[0]] = 'active'; toast(self, m[0] + ' will keep renewing.'); }
            else if (m[6]) { n[m[0]] = 'cancel'; toast(self, m[0] + ' stays on until 12 Oct 2026, then stops.'); }
            self.setState({ over: n }); } };
      }),
      inv: INV.map(function (i) { var paid = i[5] === 'Paid'; return { no: i[0], d: i[1], f: i[2], pw: i[3], a: bdt(i[4]), st: i[5], bb: paid ? '#e7f8f1' : '#fff4e0', bf: paid ? '#047857' : '#a14f06', dl: function () { toast(self, 'Invoice ' + i[0] + ' downloaded.'); } }; }),
      renewAmt: bdt(total), renewNote: 'Charged on 9 Oct 2026 for 12 Oct – 11 Nov.',
      renewLines: active.filter(function (r) { return r.st === 'active'; }).map(function (r) { return { l: r.m[0], v: r.m[6] ? bdt(r.m[6]) : 'Included' }; }).slice(0, 7),
      autoRenew: mkSw(self, 'autoRenew', true),
      changeCard: function () { toast(self, 'SSLCOMMERZ opens to save a new card or mobile wallet.'); }
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
.stp2 span{min-width:64px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:#0b1733;color:#cbd8ee;font-size:var(--text-xs);line-height:18px;white-space:pre-wrap;--text-muted:#94a3b8}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
/* phones: the Modules title and note take the full width, the status filter sits under them on one scrolling row;
   the payment card keeps its logo and button inside the card */
@media (max-width:640px){
  .sub-mhead{flex-wrap:wrap;padding:16px 16px 12px!important}
  .sub-mhead>div:first-child{flex:1 1 100%!important;min-width:0}
  .sub-mhead>.lseg{max-width:100%;overflow-x:auto;scrollbar-width:none}
  .sub-mhead>.lseg::-webkit-scrollbar{display:none}
  .sub-mhead>.lseg>button{flex:none;white-space:nowrap;height:36px}
  .sub-pmhead{flex-wrap:wrap;gap:var(--space-2) var(--space-4)!important}
  .sub-pmhead>div:first-child{flex:1 1 180px;min-width:0}
  .sub-change{align-self:stretch!important;height:44px!important}
}
`;

// ---- markup ----

export default class SubscriptionScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Subscription">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="set-billing" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Settings" page={"Subscription & billing"} placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"Settings · Subscription & billing"}</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>The plan, every module with its trial and validity, and all invoices. Renewals are charged through SSLCOMMERZ.</p>
                  </div>
                  <__Link href="/credit-wallet" className="btn sm" style={{ background: "#fff", color: "#0b1733", height: "38px", flexShrink: "0" }}>{"Wallet & credits"}</__Link>
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
              <section className="tc" style={{ overflow: "hidden" }}>
                <div className="sub-mhead" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 20px 12px" }}>
                  <div style={{ flexGrow: "1" }}>
                    <h2 className="h2">Modules</h2>
                    <p className="sub">Each module shows when it started, how much of the 14-day trial was used and how long it stays valid.</p>
                  </div>
                  <div className="lseg" role="tablist">
                    {__list(v.segs).map((m, $index) => (<React.Fragment key={$index}>
                        <button type="button" role="tab" aria-selected={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div className="gc-table-wrap">
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Status</th>
                        <th>Activated</th>
                        <th>Trial used</th>
                        <th>Valid until</th>
                        <th className="r">Per month</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.mods).map((m, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td>
                              <div style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{m?.n}</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{m?.d}</div>
                            </td>
                            <td>
                              <span className="badge" style={__sx(`background: ${m?.bb ?? ""}; color: ${m?.bf ?? ""};`)}>{m?.st}</span>
                            </td>
                            <td style={{ color: "#475569", whiteSpace: "nowrap" }}>{m?.act}</td>
                            <td style={{ minWidth: "130px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#eef1f6", overflow: "hidden" }}>
                                  <div style={__sx(`width: ${m?.tw ?? ""}; height: 100%; background: ${m?.tc ?? ""};`)} />
                                </div>
                                <span className="tn" style={{ fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}>{m?.tl}</span>
                              </div>
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              <div style={{ color: "#0f172a" }}>{m?.until}</div>
                              <div style={__sx(`font-size: var(--text-xs); color: ${m?.lc ?? ""};`)}>{m?.left}</div>
                            </td>
                            <td className="r tn">{m?.p}</td>
                            <td className="r">
                              <button type="button" className={m?.bcls} onClick={m?.act2}>{m?.btn}</button>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "18px 20px 12px" }}>
                    <h2 className="h2">Billing history</h2>
                    <p className="sub">Invoices from GridCommerce. VAT included, amounts in BDT.</p>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Date</th>
                          <th>For</th>
                          <th>Paid with</th>
                          <th className="r">Amount</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.inv).map((i, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{i?.no}</td>
                              <td style={{ whiteSpace: "nowrap", color: "#475569" }}>{i?.d}</td>
                              <td style={{ color: "#475569" }}>{i?.f}</td>
                              <td style={{ color: "#475569" }}>{i?.pw}</td>
                              <td className="r tn" style={{ fontWeight: "var(--weight-medium)" }}>{i?.a}</td>
                              <td>
                                <span className="badge" style={__sx(`background: ${i?.bb ?? ""}; color: ${i?.bf ?? ""};`)}>{i?.st}</span>
                              </td>
                              <td className="r">
                                <button type="button" className="abtn" onClick={i?.dl}>PDF</button>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Next renewal</h2>
                      <p className="sub">{v.renewNote}</p>
                    </div>
                    <div className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.renewAmt}</div>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.renewLines).map((r, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ color: "#475569" }}>{r?.l}</span>
                            <span className="tn" style={{ color: "#0f172a", fontWeight: "var(--weight-medium)" }}>{r?.v}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec">
                    <div className="sub-pmhead" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                      <div>
                        <h2 className="h2">Payment method</h2>
                        <p className="sub">Renewals are charged 3 days before the date.</p>
                      </div>
                      <PaymentLogo provider="sslcommerz" variant="full" size={22} />
                    </div>
                    <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                      <div className="chk">
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Renew automatically</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Visa ending 4417, saved on SSLCOMMERZ.</div>
                        </div>
                        <button type="button" className={v.autoRenew?.cls} role="switch" aria-checked={v.autoRenew?.on} aria-label="Renew automatically" onClick={v.autoRenew?.toggle} />
                      </div>
                    </div>
                    <button type="button" className="btn line sm sub-change" onClick={v.changeCard} style={{ alignSelf: "flex-start" }}>Change payment method</button>
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
