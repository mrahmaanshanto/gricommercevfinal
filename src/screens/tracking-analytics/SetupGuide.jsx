'use client';
// Generated from design/templates/tracking-analytics/SetupGuide.dc.html by scripts/convert-design.mjs.
// G3 · Setup guides — Tracking & analytics — Setup guides overview.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { TA_PHONE_CSS } from './taPhone';

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

var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
// key, name, logo, lettermark [bg, fg, text], what, minutes, status, href, needs
var GUIDES = [
  ['gtm', 'Google Tag Manager', null, ['#e8f0fe', '#1a56db', 'GTM'], 'One container for every tag. The data layer is filled on each page automatically.', 10, 'live', 'SetupGTM.dc.html', ['Container ID (GTM-XXXXXXX)', 'Publish access to the container']],
  ['ga4', 'Google Analytics 4', 'google', null, 'Traffic sources, funnels and revenue, with Bangla and English product names kept intact.', 8, 'live', 'SetupGA4.dc.html', ['Measurement ID (G-XXXXXXXXXX)', 'Measurement Protocol API secret', 'Editor role on the property']],
  ['meta', 'Meta Pixel & CAPI', 'meta', null, 'Facebook and Instagram ads learn from orders, even when the browser blocks the pixel.', 12, 'prog', 'SetupMetaPixel.dc.html', ['Pixel ID (15–16 digits)', 'Conversions API access token', 'Admin access in Business Manager']],
  ['tiktok', 'TikTok Pixel & Events API', 'tiktok', null, 'TikTok ads optimise for real buyers, with server events covering in-app browsers.', 10, 'new', 'SetupTikTok.dc.html', ['Pixel code', 'Events API access token', 'TikTok Ads Manager admin']],
  ['gads', 'Google Ads conversions', 'google', null, 'Search and Performance Max bid on confirmed COD orders instead of button clicks.', 12, 'new', 'SetupGoogleAds.dc.html', ['Conversion ID and label', 'Linked GA4 property', 'Admin on the Ads account']],
  ['clarity', 'Microsoft Clarity', null, ['#eef2ff', '#4338ca', 'C'], 'Free heatmaps and session recordings. Phone numbers and addresses are masked.', 5, 'new', 'SetupClarity.dc.html', ['Clarity project ID', 'A Microsoft or Google sign-in']]
];
var ROUTE = [
  ['Connections.dc.html', 'Connections', 'Sign in to Google, Meta and TikTok accounts.', 'অ্যাকাউন্ট যুক্ত করুন'],
  ['SetupGuide.dc.html', 'Setup guides', 'Add IDs and tokens, platform by platform. This page.', 'আইডি ও টোকেন বসান'],
  ['PixelsEvents.dc.html', 'Pixels & events', 'Check each event fires from browser and server.', 'ইভেন্ট চালু আছে কিনা দেখুন'],
  ['EventHealth.dc.html', 'Event health', 'Fix errors, duplicates and low match quality.', 'ভুল ও ডুপ্লিকেট ঠিক করুন'],
  ['AnalyticsHub.dc.html', 'Analytics hub', 'See traffic, orders and ad spend together.', 'রিপোর্ট দেখুন'],
  ['Attribution.dc.html', 'Attribution & UTM', 'Credit each order to the right ad and link.', 'কোন বিজ্ঞাপন থেকে অর্ডার'],
];
var ORDER = ['gtm', 'ga4', 'meta', 'tiktok', 'gads', 'clarity'];
var SHORT = { gtm: 'GTM', ga4: 'GA4', meta: 'Meta', tiktok: 'TikTok', gads: 'Google Ads', clarity: 'Clarity' };
var SB = { live: ['Live', '#e7f8f1', '#047857', 'Review', 'abtn'], prog: ['In progress', '#fff4e0', '#a14f06', 'Continue setup', 'btn solid sm'], new: ['Not started', '#f1f5f9', '#475569', 'Start guide', 'btn soft sm'] };
var CHECKS = [
  ['gtm-id', 'Add the GTM container ID', 'GTM', 1], ['gtm-pub', 'Publish the GTM container', 'GTM', 1],
  ['ga4-id', 'Add the GA4 measurement ID', 'GA4', 1], ['ga4-sec', 'Add the Measurement Protocol secret', 'GA4', 1],
  ['meta-id', 'Paste the Meta Pixel ID', 'Meta', 1], ['meta-tok', 'Add the Conversions API token', 'Meta', 1], ['meta-test', 'Pass a Meta test event', 'Meta', 0],
  ['tt', 'Connect the TikTok pixel and Events API', 'TikTok', 0], ['gads', 'Import Google Ads conversions', 'Google Ads', 0], ['clar', 'Add the Clarity project ID', 'Clarity', 0]
];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var ck = s.ck || {}; CHECKS.forEach(function (c) { if (ck[c[0]] == null) ck[c[0]] = !!c[3]; });
    var nCk = CHECKS.filter(function (c) { return ck[c[0]]; }).length;
    var byK = {}; GUIDES.forEach(function (g) { byK[g[0]] = g; });
    var live = GUIDES.filter(function (g) { return g[6] === 'live'; }).length;
    var left = GUIDES.filter(function (g) { return g[6] !== 'live'; }).reduce(function (a, g) { return a + g[5]; }, 0);
    var v = {
      sub: live + ' of 6 live. Meta is next, then TikTok, Google Ads and Clarity. About ' + left + ' minutes left in total.',
      tiles: [
        { l: 'Live', v: String(live), s: 'GTM and GA4 sending data', c: '#34d399' },
        { l: 'In progress', v: '1', s: 'Meta · test event pending', c: '#fbbf24' },
        { l: 'Not started', v: '3', s: 'TikTok, Google Ads, Clarity', c: 'rgba(203,216,238,.6)' },
        { l: 'Time left', v: '~' + left + ' min', s: 'for the remaining guides', c: '#60a5fa' }
      ],
      route: ROUTE.map(function (r, i) { var here = r[0] === 'SetupGuide.dc.html'; return { n: String(i + 1), href: r[0], t: r[1], d: r[2], bn: r[3], bg: here ? 'rgba(0,48,135,.04)' : '#fff', bd: here ? '#003087' : '#e7ebf2', nb: here ? '#003087' : '#f1f4f9', nf: here ? '#fff' : '#334155' }; }),
      order: ORDER.map(function (k, i) { var g = byK[k], st = g[6]; return { n: st === 'live' ? '✓' : String(i + 1), l: SHORT[k], href: g[7], arr: i < ORDER.length - 1,
        nb: st === 'live' ? '#e7f8f1' : st === 'prog' ? '#003087' : '#f1f4f9', nf: st === 'live' ? '#047857' : st === 'prog' ? '#fff' : '#64748b',
        bd: st === 'prog' ? '#003087' : '#e7ebf2', bg: st === 'prog' ? 'rgba(0,48,135,.04)' : '#fff' }; }),
      cards: ORDER.map(function (k, i) { var g = byK[k], b = SB[g[6]]; return { n: i + 1, href: g[7], name: g[1], what: g[4], time: g[5], need: g[8],
        hasImg: !!g[2], noImg: !g[2], lg: g[2] ? LOGO[g[2]] : '', lt: g[3] ? g[3][2] : '', lb: g[3] ? g[3][0] : '#fff', lf: g[3] ? g[3][1] : '#0f172a',
        bl: b[0], bb: b[1], bf: b[2], btn: b[3], bcls: b[4] }; }),
      ckLabel: nCk + ' of ' + CHECKS.length + ' done', ckW: (nCk / CHECKS.length * 100) + '%',
      checks: CHECKS.map(function (c) { var on = !!ck[c[0]]; return { l: c[1], g: c[2], on: on, cls: on ? 'box on' : 'box', tc: on ? '#64748b' : '#0f172a', td: on ? 'line-through' : 'none',
        toggle: function () { var n = assign({}, ck); n[c[0]] = !on; self.setState({ ck: n }); if (!on && nCk + 1 === CHECKS.length) toast(self, 'All tracking steps are done.'); } }; }),
      why: [
        { v: '~30%', t: 'iPhone users opt out of tracking', d: 'iOS asks every app user; most say no, so in-app pixel events drop.', bg: '#ffece6', fg: '#b83210' },
        { v: '~20%', t: 'Ad blockers and privacy browsers', d: 'Blocked pixel scripts never fire, while server events still arrive.', bg: '#fff4e0', fg: '#a14f06' },
        { v: '2–4 days', t: 'COD orders confirm later', d: 'Confirmation and delivery happen after the visit, when no browser is open to send them.', bg: 'rgba(0,48,135,.08)', fg: '#003087' }
      ]
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

.gm{width:44px;height:44px;border-radius:var(--radius-xl);background:#fff;border:1px solid #e7ebf2;box-shadow:0 1px 2px rgba(15,23,42,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:var(--weight-semibold);font-size:var(--text-sm)}
.gcard{display:flex;flex-direction:column;gap:14px;padding:20px;text-decoration:none;color:inherit}
.gcard:hover{text-decoration:none;color:inherit}
.need{display:flex;align-items:flex-start;gap:8px;font-size:var(--text-xs-plus);line-height:18px;color:#334155}
.need::before{content:"";width:5px;height:5px;border-radius:var(--radius-full);background:#94a3b8;margin-top:7px;flex-shrink:0}
.bar{height:8px;border-radius:var(--radius-full);background:#eef1f6;overflow:hidden}
.ck{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 200ms}
.ck:hover{background:#f7f9fd}.ck:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.box{width:20px;height:20px;border-radius:var(--radius-md);border:2px solid #cbd5e1;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;transition:background-color 200ms,border-color 200ms}
.box.on{background:#003087;border-color:#003087}
.ord{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--radius-xl);border:1px solid #e7ebf2;background:#fff;text-decoration:none;color:#0f172a;flex:1;min-width:0}
.ord:hover{border-color:#94a3b8;text-decoration:none;color:#0f172a}

.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
@media (max-width:1023px){
  .sg-route{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media (max-width:640px){
  /* procedure: one step per row */
  .sg-route{grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
  .sg-route .ord{padding:10px 12px!important}
  .sg-ohead{flex-wrap:wrap;row-gap:2px!important}
  /* recommended order: one row that scrolls sideways */
  .sg-order{overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:2px 20px}
  .sg-order::-webkit-scrollbar{display:none}
  .sg-order>.ord{flex:none}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class SetupGuideScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SetupGuide">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="ta-setup" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Tracking & analytics"} page="Setup guides" placeholder="Search guides, events or tags" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">G3 · Setup guides</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>Set up tracking in 6 steps</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "640px" }}>{v.sub}</p>
                  </div>
                  <__Link href="/connections" className="btn sm" style={{ background: "#fff", color: "#0b1733", height: "38px", flexShrink: "0" }}>Account connections</__Link>
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
              <section className="tc" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>The connection procedure, page by page</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)" }}>{"Six pages in Tracking & analytics, used in this order. Each step opens the page where it happens."}</p>
                </div>
                <ol className="sg-route" style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "10px" }}>
                  {__list(v.route).map((r, $index) => (<React.Fragment key={$index}>
                      <li style={{ display: "flex", minWidth: "0" }}>
                        <__A href={r?.href} className="ord" style={__sx(`flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; background: ${r?.bg ?? ""}; border-color: ${r?.bd ?? ""};`)}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${r?.nb ?? ""}; color: ${r?.nf ?? ""};`)}>{r?.n}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.t}</span>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}>{r?.d}</span>
                          <span className="bn" style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{r?.bn}</span>
                        </__A>
                      </li>
                    </React.Fragment>))}
                </ol>
              </section>
              <section className="tc" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="sg-ohead" style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Recommended order</h2>
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>GTM first, so every later tag loads through one container.</span>
                </div>
                <div className="sg-order" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {__list(v.order).map((o, $index) => (<React.Fragment key={$index}>
                      <__A href={o?.href} className="ord" style={__sx(`border-color: ${o?.bd ?? ""}; background: ${o?.bg ?? ""};`)}>
                        <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); flex-shrink: 0; background: ${o?.nb ?? ""}; color: ${o?.nf ?? ""};`)}>{o?.n}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o?.l}</span>
                      </__A>
                      {o?.arr ? (<>
                        <span style={{ color: "var(--text-muted)", display: "flex", flexShrink: "0" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                      </>) : null}
                    </React.Fragment>))}
                </div>
              </section>
              <div className="st gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                {__list(v.cards).map((g, $index) => (<React.Fragment key={$index}>
                    <__A href={g?.href} className="tc lift gcard">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="gm" style={__sx(`color: ${g?.lf ?? ""}; background: ${g?.lb ?? ""};`)}>
                          {g?.hasImg ? (<>
                            <img src={g?.lg} alt="" width="24" height="24" style={{ width: "24px", height: "24px", objectFit: "contain", display: "block" }} />
                          </>) : null}
                          {g?.noImg ? (<>
                            <span>{g?.lt}</span>
                          </>) : null}
                        </span>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>{g?.name}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Step {g?.n} · about {g?.time} min</div>
                        </div>
                        <span className="badge" style={__sx(`background: ${g?.bb ?? ""}; color: ${g?.bf ?? ""};`)}>{g?.bl}</span>
                      </div>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569", minHeight: "38px" }}>{g?.what}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f7f9fc" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>What you need</div>
                        {__list(g?.need).map((nd, $index) => (<React.Fragment key={$index}>
                            <span className="need">{nd}</span>
                          </React.Fragment>))}
                      </div>
                      <span className={g?.bcls} style={{ alignSelf: "flex-start" }}>{g?.btn}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></span>
                    </__A>
                  </React.Fragment>))}
              </div>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "18px 20px 14px", display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid #eef1f6" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Setup checklist</h2>
                      <span className="tn" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>{v.ckLabel}</span>
                    </div>
                    <div className="bar">
                      <div className="gr" style={__sx(`width: ${v.ckW ?? ""}; height: 100%; background: #003087; border-radius: var(--radius-full);`)} />
                    </div>
                  </div>
                  {__list(v.checks).map((k, $index) => (<React.Fragment key={$index}>
                      <button type="button" className="ck" role="checkbox" aria-checked={k?.on} onClick={k?.toggle}>
                        <span className={k?.cls}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span style={__sx(`flex-grow: 1; font-size: var(--text-sm); color: ${k?.tc ?? ""}; text-decoration: ${k?.td ?? ""};`)}>{k?.l}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{k?.g}</span>
                      </button>
                    </React.Fragment>))}
                </section>
                <details className="tc gc-disclose">
                  <summary>Why server-side tracking matters for COD stores</summary>
                  {__list(v.why).map((w, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span className="tn" style={__sx(`min-width: 58px; height: 32px; padding: 0 8px; border-radius: var(--radius-lg); background: ${w?.bg ?? ""}; color: ${w?.fg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{w?.v}</span>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{w?.t}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{w?.d}</div>
                        </div>
                      </div>
                    </React.Fragment>))}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Estimates for Bangladeshi mobile traffic. Actual loss varies by store.</div>
                </details>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
