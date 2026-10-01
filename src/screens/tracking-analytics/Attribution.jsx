'use client';
// Generated from design/templates/tracking-analytics/Attribution.dc.html by scripts/convert-design.mjs.
// G2 · Attribution & UTM — Tracking & analytics — Attribution & UTM.
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
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
var PL = { meta: ['Meta', '#e7efff', '#1d4ed8'], google: ['Google', '#e7f8f1', '#047857'], tiktok: ['TikTok', '#f1f5f9', '#0f172a'], gc: ['GridCommerce', '#fff4e0', '#a14f06'] };
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function plv(k) { var p = PL[k]; return { pl: p[0], pb: p[1], pf: p[2], lg: LOGO[k] || '' }; }
function pct(n) { return (Math.round(n * 10) / 10) + '%'; }
function x2(n) { return (Math.round(n * 100) / 100).toFixed(2) + '×'; }
var PERIOD = [['7', '7 days'], ['30', '30 days'], ['90', '90 days']];
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PF = { meta: [124500, 940000, 1190, 952, 790, 676, 672000, 64, 410, 38400, 1920000], google: [38200, 310000, 360, 318, 272, 238, 248000, 18, 142, 9100, 212000], tiktok: [22300, 185000, 240, 150, 118, 98, 96000, 14, 71, 11800, 1340000] };
var COST = { courier: 70, ret: 120, pack: 15 };
function agg(keys) { var t = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; keys.forEach(function (k) { PF[k].forEach(function (x, i) { t[i] += x; }); }); return t; }
function netRev(a) { return a[6] - a[5] * COST.courier - a[7] * COST.ret - a[4] * COST.pack; }
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? 'rgba(16,185,129,.16)' : 'rgba(244,63,94,.16)', df: ok ? '#34d399' : '#fb7185' }; }
function deltaL(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? '#e7f8f1' : '#ffece6', df: ok ? '#047857' : '#be123c' }; }
function tile(l, v, s, c, vals, dp, good) { var sp = sparkP(vals); var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, line: sp.line, area: sp.area, d: dl.d, db: dl.db, df: dl.df }; }
function dseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : 'rgba(226,232,240,.85)', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : '#64748b', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function kfmt(n) { return n >= 100000 ? '৳' + (n / 100000).toFixed(n >= 1000000 ? 1 : 2) + 'L' : n >= 1000 ? '৳' + Math.round(n / 1000) + 'k' : '৳' + Math.round(n); }
var CH = { last: [['Meta ads', 612, 598000], ['Google ads', 238, 248000], ['TikTok ads', 64, 62000], ['Google organic', 171, 168000], ['Creator codes', 58, 61000], ['Direct / WhatsApp', 111, 104000]], first: [['Meta ads', 540, 530000], ['Google ads', 152, 160000], ['TikTok ads', 196, 181000], ['Google organic', 188, 184000], ['Creator codes', 72, 76000], ['Direct / WhatsApp', 106, 100000]] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var L = CH.last, F = CH.first, tl = 0, tf = 0; L.forEach(function (r) { tl += r[1]; }); F.forEach(function (r) { tf += r[1]; });
    var page = s.page || '/offers/eid-gift-box', src = s.src || 'facebook', med = s.med || 'paid', camp = s.camp != null ? s.camp : 'Eid Gift Box 2026';
    var slug = String(camp).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var AVC = [['#fce7f3', '#9d174d'], ['#e0e7ff', '#3730a3'], ['#fff4e0', '#a14f06'], ['#e7f8f1', '#047857']];
    var v = {
      tiles: [tile('Orders with full path', '94%', 'of delivered orders', '#60a5fa', series(14, 92, 2, 1, .1), 3), tile('Touches before buying', '2.7', 'median', '#a78bfa', series(14, 2.6, .2, 3), 4), tile('Days to decide', '3.4', 'first visit → order', '#fbbf24', series(14, 3.5, .4, 5, -.2), -6, 'down'), tile('Creator code revenue', '৳1,11,800', '76 orders', '#f472b6', series(14, 3700, 800, 7, .4), 22), tile('Survey answered', '64%', 'at checkout', '#34d399', series(14, 60, 4, 9, .2), 5)],
      path: [['t', 'TikTok ad', '“30 days of SPF” · 12 Sep', 'FIRST TOUCH', '#fff', '#9d174d', '#fce7f3', '#9d174d'], ['ig', 'Instagram post', 'Organic Reel · 14 Sep', '', '#fae8ff', '#86198f', '', ''], ['G', 'Google search', '“gridshop sunscreen” · 16 Sep', 'LAST TOUCH', '#fff', '#047857', '#dcfce7', '#047857'], ['৳', 'Order placed', '৳1,290 · COD · 16 Sep', '', '#fff4e0', '#a14f06', '', ''], ['✓', 'Delivered', 'Pathao · 18 Sep', 'COUNTED HERE', '#0b1733', '#fff', '#0b1733', '#fff']].map(function (p) { var lk = p[0] === 't' ? 'tiktok' : p[0] === 'G' ? 'google' : ''; return { lg: lk ? LOGO[lk] : '', hasLg: !!lk, noLg: !lk, i: p[0], t: p[1], s: p[2], tag: p[3], hasTag: !!p[3], b: p[4], f: p[5], tb: p[6], tc: p[7] }; }),
      chans: L.map(function (r, k) { var lp = r[1] / tl * 100, fp = F[k][1] / tf * 100, d = Math.round(fp - lp); var dl = d >= 0 ? { d: '+' + d + ' pts', db: '#f3e8ff', df: '#6d28d9' } : { d: d + ' pts', db: '#e0f2fe', df: '#1d4ed8' }; return { n: r[0], l: Math.round(lp) + '%', lw: lp / 60 * 100 + '%', f: Math.round(fp) + '%', fw: fp / 60 * 100 + '%', d: dl.d, db: dl.db, df: dl.df }; }),
      hear: [['Facebook or Instagram', 41, '#2563eb'], ['Friend or family', 22, '#7c3aed'], ['TikTok', 14, '#db2777'], ['Google', 11, '#059669'], ['Creator', 8, '#f59e0b'], ['Walked past', 4, '#94a3b8']].map(function (h) { return { l: h[0], w: h[1] + '%', h: (h[1] / 41 * 88) + '%', c: h[2], n: Math.round(h[1] * 6.48) }; }),
      askHear: mkSw(this, 'askHear', true),
      infl: [['Nadia’s Skin Diary', 'NADIA10', 38, 41200, 4120], ['TechBangla Reviews', 'TBR500', 11, 49400, 5500], ['Dhaka Style Files', 'DSF15', 23, 19800, 3000], ['Mitul Cooks', 'MITUL5', 4, 1400, 1000]].map(function (i2, k) { var x = i2[3] / i2[4]; var sp = sparkP(series(14, i2[2], i2[2] * .3, k * 2 + 1, x > 4 ? .5 : -.4)); var a2 = AVC[k]; var nm = i2[0].split(' '); return { n: i2[0], ini: (nm[0].charAt(0) + nm[1].charAt(0)).toUpperCase(), ab: a2[0], af: a2[1], c: i2[1], o: i2[2], r: bdt(i2[3]), p: bdt(i2[4]), x: x2(x), xb: x >= 4 ? '#e7f8f1' : x >= 2 ? '#fff4e0' : '#ffece6', xf: x >= 4 ? '#047857' : x >= 2 ? '#a14f06' : '#be123c', line: sp.line, area: sp.area, cc: x >= 4 ? '#059669' : x >= 2 ? '#d97706' : '#e11d48' }; }),
      uPage: page, uSrc: src, uMed: med, uCamp: camp, uBase: 'https://gridshop.com.bd' + page, uSlug: slug,
      setPage: function (e) { self.setState({ page: e.target.value }); }, setSrc: function (e) { self.setState({ src: e.target.value }); }, setMed: function (e) { self.setState({ med: e.target.value }); }, typeCamp: function (e) { self.setState({ camp: e.target.value }); },
      copyUrl: function () { toast(self, 'Link copied.'); }, shortUrl: function () { toast(self, 'Short link: gsh.bd/' + slug.slice(0, 8) + ' — clicks are counted too.'); }
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
.at-hlist{display:none}
@media (max-width:640px){
  .at-hctl{width:100%}
  .at-win{width:100%}
  .at-win select{flex:1 1 auto;width:auto!important;min-width:0}
  /* one order, start to finish: a vertical timeline */
  .at-path{grid-template-columns:minmax(0,1fr)!important;gap:14px!important}
  .at-path>.at-line{left:27px!important;right:auto!important;top:28px!important;bottom:28px!important;width:2px!important;height:auto!important;background:linear-gradient(180deg,#db2777,#c026d3,#059669,#f59e0b,#0b1733)!important}
  .at-step{display:grid!important;grid-template-columns:56px minmax(0,1fr);column-gap:14px;row-gap:2px!important;align-items:center!important;justify-items:start;text-align:left!important}
  .at-step>span:first-child{grid-row:1 / span 3;align-self:start}
  .at-step>span:not(:first-child){grid-column:2}
  /* first vs last touch: name + change on one line, the two bars full width below */
  .at-chrow{grid-template-columns:minmax(0,1fr) auto!important;row-gap:6px!important}
  .at-chrow>div{grid-column:1 / -1;order:3}
  .at-legend{flex-wrap:wrap;gap:6px 16px!important}
  /* how did you hear: a list with bars instead of six thin columns */
  .at-hbars,.at-hlabels{display:none!important}
  .at-hlist{display:flex;flex-direction:column;gap:10px}
  .at-hrow{display:grid;grid-template-columns:minmax(0,1fr) 40px;gap:4px 10px;align-items:center;font-size:var(--text-xs-plus)}
  .at-hrow>i{grid-column:1 / -1;display:block;height:8px;border-radius:var(--radius-full);background:#f1f4f9;overflow:hidden}
  .at-hrow>i>b{display:block;height:100%;border-radius:var(--radius-full)}
  .at-utm{grid-template-columns:minmax(0,1fr)!important}
  .at-url{flex-wrap:wrap}
  .at-url>.mono{flex:1 1 100%!important}
  .at-chead{padding:0 16px}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class AttributionScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Attribution">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Tracking & analytics"} page={"Attribution & UTM"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"G2 · Attribution & UTM"}</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>Who really brought the sale</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "640px" }}>Every order keeps the first and last place the buyer came from, any creator code, and what they told you at checkout.</p>
                  </div>
                  <div className="at-hctl" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: "0" }}>
                    <div className="dseg at-win" style={{ padding: "3px 3px 3px 12px", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "var(--text-xs)", color: "rgba(226,232,240,.8)" }}>Credit window</span>
                      <select className="inp" aria-label="Window" style={{ height: "32px", width: "150px", borderRadius: "var(--radius-full)", border: "0", fontSize: "var(--text-xs-plus)" }}>
                        <option>7 days after click</option>
                        <option>1 day after click</option>
                        <option>28 days after click</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="st gc-cols-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: var(--radius-full); background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="dl" style={__sx(`background: ${ht?.db ?? ""}; color: ${ht?.df ?? ""};`)}>{ht?.d}</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ht?.s}</span>
                        </div>
                        <svg width="100%" height="30" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", marginTop: "2px" }}>
                          <path d={ht?.area} fill={ht?.c} fillOpacity=".14" />
                          <path d={ht?.line} fill="none" stroke={ht?.c} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        </svg>
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
              <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>One order, start to finish · GC-24817 · ৳1,290 · COD</h2>
                  </div>
                </div>
                <div className="gc-cols-5 at-path" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "14px" }}>
                  <div className="at-line" style={{ position: "absolute", left: "10%", right: "10%", top: "27px", height: "2px", background: "linear-gradient(90deg, #db2777, #c026d3, #059669, #f59e0b, #0b1733)" }} />
                  {__list(v.path).map((ph, $index) => (<React.Fragment key={$index}>
                      <div className="at-step" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
                        <span style={__sx(`width: 56px; height: 56px; border-radius: var(--radius-xl); background: ${ph?.b ?? ""}; color: ${ph?.f ?? ""}; box-shadow: 0 0 0 5px #fff, 0 10px 20px -10px rgba(15,23,42,.45); display: flex; align-items: center; justify-content: center; font-weight: var(--weight-semibold); font-size: var(--text-sm-plus);`)}>
                          {ph?.hasLg ? (<>
                            <img src={ph?.lg} alt="" width="30" height="30" style={{ width: "30px", height: "30px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                          </>) : null}
                          {ph?.noLg ? (<>{ph?.i}</>) : null}
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{ph?.t}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "16px" }}>{ph?.s}</span>
                        {ph?.hasTag ? (<>
                          <span className="dl" style={__sx(`background: ${ph?.tb ?? ""}; color: ${ph?.tc ?? ""}; letter-spacing: var(--tracking-label);`)}>{ph?.tag}</span>
                        </>) : null}
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              <div className="st gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: "18px", alignItems: "stretch" }}>
                <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>First touch vs last touch</h2>
                      <p style={{ margin: "3px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Share of delivered orders. TikTok introduces far more buyers than it gets credit for.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {__list(v.chans).map((ch, $index) => (<React.Fragment key={$index}>
                        <div className="at-chrow" style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr) 70px", gap: "14px", alignItems: "center" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{ch?.n}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flexGrow: "1", height: "9px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div className="gr" style={__sx(`width: ${ch?.fw ?? ""}; height: 100%; border-radius: var(--radius-full); background: #a78bfa;`)} />
                              </div>
                              <span className="tn" style={{ width: "36px", fontSize: "var(--text-xs)", color: "#6d28d9", textAlign: "right" }}>{ch?.f}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flexGrow: "1", height: "9px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div className="gr" style={__sx(`width: ${ch?.lw ?? ""}; height: 100%; border-radius: var(--radius-full); background: #2563eb;`)} />
                              </div>
                              <span className="tn" style={{ width: "36px", fontSize: "var(--text-xs)", color: "#1d4ed8", textAlign: "right" }}>{ch?.l}</span>
                            </div>
                          </div>
                          <span className="dl" style={__sx(`background: ${ch?.db ?? ""}; color: ${ch?.df ?? ""}; justify-content: center;`)}>{ch?.d}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="at-legend" style={{ display: "flex", gap: "16px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "8px", borderRadius: "var(--radius-sm)", background: "#a78bfa" }} />First touch — who introduced them</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "8px", borderRadius: "var(--radius-sm)", background: "#2563eb" }} />Last touch — who closed the sale</span>
                  </div>
                </section>
                <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>“How did you hear about us?”</h2>
                      <p style={{ margin: "3px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Asked after the address. Catches word of mouth that no pixel can see.</p>
                    </div>
                  </div>
                  <div className="at-hbars" style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "190px", paddingTop: "8px" }}>
                    {__list(v.hear).map((hr2, $index) => (<React.Fragment key={$index}>
                        <div className="tt" style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                          <span className="tn" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{hr2?.w}</span>
                          <div style={__sx(`width: 100%; height: ${hr2?.h ?? ""}; border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-sm); background: ${hr2?.c ?? ""};`)} />
                          <span className="tip">{hr2?.n} answers</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="at-hlabels" style={{ display: "flex", gap: "12px" }}>
                    {__list(v.hear).map((hl, $index) => (<React.Fragment key={$index}>
                        <span style={{ flex: "1", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", lineHeight: "17px" }}>{hl?.l}</span>
                      </React.Fragment>))}
                  </div>
                  <div className="at-hlist">
                    {__list(v.hear).map((hl, $index) => (
                      <div className="at-hrow" key={$index}>
                        <span style={{ color: "#0f172a" }}>{hl?.l} <span style={{ color: "var(--text-muted)" }}>· {hl?.n} answers</span></span>
                        <span className="tn" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{hl?.w}</span>
                        <i aria-hidden="true"><b style={{ width: hl?.h, background: hl?.c }} /></i>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Ask at checkout</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>One tap, optional · 64% of buyers answer</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.askHear?.on} aria-label="Ask at checkout" className={v.askHear?.cls} onClick={v.askHear?.toggle} />
                  </div>
                </section>
              </div>
              <section className="tc " style={{ padding: "18px 0 4px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div className="at-chead" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Creator and influencer codes</h2>
                    <p style={{ margin: "3px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>A code credits its creator even when nobody clicked a link.</p>
                  </div>
                  <__Link href="/new-coupon" className="abtn" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New code</__Link>
                </div>
                <div className="gc-table-wrap">
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Code</th>
                        <th>Trend</th>
                        <th className="r">Orders</th>
                        <th className="r">Delivered revenue</th>
                        <th className="r">Paid</th>
                        <th>Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.infl).map((inf, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 34px; height: 34px; border-radius: var(--radius-full); background: ${inf?.ab ?? ""}; color: ${inf?.af ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{inf?.ini}</span>
                                <span style={{ fontWeight: "var(--weight-medium)" }}>{inf?.n}</span>
                              </div>
                            </td>
                            <td>
                              <span className="mono" style={{ fontWeight: "var(--weight-semibold)", padding: "4px 8px", borderRadius: "var(--radius-md)", background: "#f1f4f9" }}>{inf?.c}</span>
                            </td>
                            <td style={{ width: "110px" }}>
                              <svg width="100" height="26" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                                <path d={inf?.area} fill={inf?.cc} fillOpacity=".12" />
                                <path d={inf?.line} fill="none" stroke={inf?.cc} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                              </svg>
                            </td>
                            <td className="r tn">{inf?.o}</td>
                            <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{inf?.r}</td>
                            <td className="r tn" style={{ color: "var(--text-muted)" }}>{inf?.p}</td>
                            <td>
                              <span className="dl" style={__sx(`background: ${inf?.xb ?? ""}; color: ${inf?.xf ?? ""};`)}>{inf?.x}</span>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>UTM link builder</h2>
                  </div>
                </div>
                <div className="at-utm" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Page</span>
                    <select className="inp" value={v.uPage} onChange={v.setPage} aria-label="Page">
                      <option value="/offers/eid-gift-box">Eid gift box offer</option>
                      <option value="/p/sunscreen-spf50-50ml">Sunscreen SPF50</option>
                      <option value="/lp/kurti-new-drop">Kurti new drop</option>
                      <option value="/">Home page</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Posted on</span>
                    <select className="inp" value={v.uSrc} onChange={v.setSrc} aria-label="Source">
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="creator">Creator / influencer</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Type</span>
                    <select className="inp" value={v.uMed} onChange={v.setMed} aria-label="Medium">
                      <option value="paid">Paid ad</option>
                      <option value="organic">Organic post</option>
                      <option value="message">Message</option>
                      <option value="bio">Bio link</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Campaign</span>
                    <input className="inp" value={v.uCamp} onInput={v.typeCamp} onChange={v.typeCamp} aria-label="Campaign" />
                  </label>
                </div>
                <div className="at-url" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#0b1733", "--text-muted": "#94a3b8" }}>
                  <div className="mono" style={{ flexGrow: "1", fontSize: "var(--text-xs-plus)", lineHeight: "20px", wordBreak: "break-all", color: "#cbd5e1" }}>
                    <span style={{ color: "#fff" }}>{v.uBase}</span>
                    <span style={{ color: "var(--text-muted)" }}>?utm_source=</span>
                    <span style={{ color: "#fbbf24" }}>{v.uSrc}</span>
                    <span style={{ color: "var(--text-muted)" }}>{"&utm_medium="}</span>
                    <span style={{ color: "#34d399" }}>{v.uMed}</span>
                    <span style={{ color: "var(--text-muted)" }}>{"&utm_campaign="}</span>
                    <span style={{ color: "#93c5fd" }}>{v.uSlug}</span>
                  </div>
                  <button type="button" className="btn sm" onClick={v.copyUrl} style={{ background: "#fff", color: "#0b1733" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button type="button" className="btn sm" onClick={v.shortUrl} style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Short link</button>
                </div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Names become lower-case with dashes, so “Eid” and “eid” never split into two campaigns.</div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
