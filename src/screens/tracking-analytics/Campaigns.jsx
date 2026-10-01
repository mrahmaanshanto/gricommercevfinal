'use client';
// Generated from design/templates/tracking-analytics/Campaigns.dc.html by scripts/convert-design.mjs.
// G2 · Campaigns & creatives — Tracking & analytics — Campaigns & creatives.
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
// platform, name, objective, status, spend, claimed purchases, delivered, delivered rev, returned, budget pace %
var CP = [['meta', 'Eid gift box · Advantage+', 'Sales · Advantage+ shopping', 'Active', 38400, 402, 236, 231000, 18, 82], ['meta', 'Sunscreen retarget · 7 days', 'Sales · website visitors', 'Active', 14200, 188, 131, 118000, 6, 64], ['meta', 'Messenger — skin quiz', 'Messages', 'Active', 18800, 96, 72, 64800, 9, 71], ['meta', 'Phones Dhaka · broad', 'Sales · broad', 'Limited', 29600, 260, 118, 142000, 21, 95], ['meta', 'Reels — kurti new drop', 'Sales · Reels', 'Active', 23500, 244, 119, 116200, 10, 58], ['google', 'Shopping · all products', 'Performance Max', 'Active', 22400, 214, 150, 158000, 9, 76], ['google', 'Search · brand terms', 'Search', 'Active', 6800, 98, 71, 68000, 3, 44], ['google', 'Search · sunscreen bd', 'Search', 'Active', 9000, 48, 17, 22000, 6, 90], ['tiktok', 'Spark ads · creator reviews', 'Website conversions', 'Active', 14300, 162, 66, 64000, 9, 67], ['tiktok', 'TikTok Shop · live Friday', 'Shop ads', 'Rejected', 8000, 78, 32, 32000, 5, 100]];
var CR = [['“Why my skin stopped peeling”', 'Reel · 22 s', 'meta', 6.1, '3.8%', 96, 11200, 'linear-gradient(160deg,#9a3412,#1f2937)'], ['Unboxing the Eid gift box', 'Video · 15 s', 'meta', 5.4, '2.9%', 88, 12400, 'linear-gradient(160deg,#065f46,#0f172a)'], ['Creator: 30 days of SPF', 'Spark ad', 'tiktok', 4.7, '2.2%', 41, 8100, 'linear-gradient(160deg,#6d28d9,#111827)'], ['A55 vs A35 in 10 seconds', 'Video · 10 s', 'meta', 4.1, '1.9%', 64, 13200, 'linear-gradient(160deg,#1d4ed8,#0f172a)'], ['Shopping · product images', 'Shopping ad', 'google', 3.9, '1.4%', 150, 22400, 'linear-gradient(160deg,#047857,#1e293b)'], ['Kurti colours carousel', 'Carousel · 6', 'meta', 3.2, '1.7%', 55, 10300, 'linear-gradient(160deg,#be185d,#1e293b)'], ['“COD all over Bangladesh”', 'Image', 'meta', 2.1, '1.1%', 38, 9800, 'linear-gradient(160deg,#475569,#0f172a)'], ['Live Friday teaser', 'Video · 30 s', 'tiktok', 1.4, '0.9%', 25, 6200, 'linear-gradient(160deg,#334155,#020617)']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'camp', pf = s.pf || 'all', so = s.so || 'roas', paused = s.paused || {};
    var rows = CP.filter(function (c) { return pf === 'all' || c[0] === pf; }).map(function (c) { var net = c[7] - c[6] * COST.courier - c[8] * COST.ret - c[6] * COST.pack; return { c: c, r: net / c[4], cpd: c[4] / c[6] }; });
    rows.sort(function (a, b) { return so === 'roas' ? b.r - a.r : so === 'spend' ? b.c[4] - a.c[4] : a.cpd - b.cpd; });
    var T = [0, 0, 0, 0]; CP.forEach(function (c) { T[0] += c[4]; T[1] += c[6]; T[2] += c[7]; T[3] += c[8]; });
    var best = rows.slice().sort(function (a, b) { return b.r - a.r; })[0];
    var v = {
      headline: CP.length + ' campaigns · best is ' + x2(best.r),
      tiles: [tile('Spend', bdt(T[0]), '10 campaigns', '#fbbf24', series(14, 6100, 700, 2, .2), 8, 'down'), tile('Delivered', String(T[1]), bdt(T[2]), '#60a5fa', series(14, 38, 6, 5, .3), 12), tile('Cost / delivered', bdt(T[0] / T[1]), 'across all', '#f472b6', series(14, 180, 18, 7, -.2), -5, 'down'), tile('Losing money', String(rows.filter(function (x) { return x.r < 2.5; }).length), 'below 2.5× real return', '#fb7185', series(14, 2, .6, 9), 0, 'down'), tile('Top creative', '6.10×', 'Reel · skin peeling', '#34d399', series(14, 5.4, .6, 11, .3), 11)],
      tabs: pTabs(self, [{ k: 'camp', label: 'All campaigns' }, { k: 'crea', label: 'Creative board' }, { k: 'terms', label: 'Search terms' }], tab, 'tab', { camp: CP.length }),
      is_camp: tab === 'camp', is_crea: tab === 'crea', is_terms: tab === 'terms',
      pf: lseg(self, [['all', 'All'], ['meta', 'Meta'], ['google', 'Google'], ['tiktok', 'TikTok']], pf, 'pf'), sorts: lseg(self, [['roas', 'Real return'], ['spend', 'Spend'], ['cpd', 'Cost / delivered']], so, 'so'),
      rows: rows.map(function (x, i) { var c = x.c; var st = paused[c[1]] ? 'Paused' : c[3]; var rr = c[8] / c[6] * 100; var sp = sparkP(series(14, x.r, x.r * .18, i + 2, x.r > 3 ? .3 : -.3)); var rc = x.r >= 4 ? '#059669' : x.r >= 2.5 ? '#d97706' : '#e11d48';
        return { lg: LOGO[c[0]], n: c[1], obj: c[2], pl: PL[c[0]][0], c: PC[c[0]], line: sp.line, area: sp.area, st: st, sb: st === 'Active' ? '#e7f8f1' : st === 'Paused' ? '#f1f5f9' : st === 'Limited' ? '#fff4e0' : '#ffece6', sf: st === 'Active' ? '#047857' : st === 'Paused' ? '#475569' : st === 'Limited' ? '#a14f06' : '#be123c', sp: bdt(c[4]), pace: c[9] + '%', pc: c[9] > 90 ? '#e11d48' : '#f59e0b', cl: c[5], dl: c[6] + ' · ' + kfmt(c[7]), cpd: bdt(x.cpd), rt: pct(rr), rtc: rr > 12 ? '#be123c' : '#475569', roas: x2(x.r), rc: rc, rw: Math.min(100, x.r / 6 * 100) + '%',
          actL: x.r < 2.5 && !paused[c[1]] ? 'Pause' : 'Open', act: function () { if (x.r < 2.5 && !paused[c[1]]) { var nn = assign({}, paused); nn[c[1]] = 1; self.setState({ paused: nn }); toast(self, c[1] + ' paused on ' + PL[c[0]][0] + '.'); } else toast(self, 'Opening ' + c[1] + ' in ' + PL[c[0]][0] + ' Ads Manager.'); } }; }),
      creas: CR.map(function (c, i) { return { lg: LOGO[c[2]], rank: i + 1, hook: c[0], fmt: c[1], pl: PL[c[2]][0], c: PC[c[2]], roas: x2(c[3]), rc: c[3] >= 4 ? '#059669' : c[3] >= 2.5 ? '#d97706' : '#e11d48', rw: Math.min(100, c[3] / 6.5 * 100) + '%', ctr: c[4], dl: c[5], sp: kfmt(c[6]), bg: c[7] }; }),
      terms: [['sunscreen price in bd', 612, 3120, 14, 'Keep'], ['gridshop', 410, 820, 38, 'Keep · brand'], ['korean sunscreen', 388, 2410, 6, 'Lower bid'], ['free sunscreen', 204, 1090, 0, 'Add as negative'], ['samsung a55 price', 350, 2960, 9, 'Keep'], ['a55 review', 162, 980, 0, 'Add as negative'], ['kurti online shopping', 240, 1410, 7, 'Keep'], ['cod shop dhaka', 98, 520, 4, 'Raise bid']].map(function (t) { var neg = t[4].indexOf('negative') >= 0, low = t[4].indexOf('Lower') >= 0; return { t: t[0], c: t[1], w: t[1] / 612 * 100 + '%', s: bdt(t[2]), o: t[3], cpd: t[3] ? bdt(t[2] / t[3]) : '—', d: t[4], db: neg ? '#ffece6' : low ? '#fff4e0' : '#e7f8f1', df: neg ? '#be123c' : low ? '#a14f06' : '#047857' }; })
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `section.tc th{white-space:normal}

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
`;

// ---- markup ----

export default class CampaignsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Campaigns">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Tracking & analytics"} page={"Campaigns & creatives"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"G2 · Campaigns & creatives · last 30 days"}</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "640px" }}>Judged by delivered orders after courier and return cost — not by what the platform reports.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: "0" }}>
                    <__Link href="/attribution" className="btn sm" style={{ background: "rgba(255,255,255,.1)", color: "#fff", height: "38px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>UTM builder</span>
                    </__Link>
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
              <section className="tc" style={{ overflow: "hidden" }}>
                <div className="ptabs" role="tablist">
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={tb?.pcls} aria-selected={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                {v.is_camp ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                    <div className="lseg">
                      {__list(v.pf).map((pq, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={pq?.pick} aria-pressed={pq?.on} style={__sx(`background: ${pq?.bg ?? ""}; color: ${pq?.fg ?? ""}; box-shadow: ${pq?.sh ?? ""};`)}>{pq?.l}</button>
                        </React.Fragment>))}
                    </div>
                    <span style={{ flexGrow: "1" }} />
                    <span className="ey">Sort</span>
                    <div className="lseg">
                      {__list(v.sorts).map((so, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={so?.pick} aria-pressed={so?.on} style={__sx(`background: ${so?.bg ?? ""}; color: ${so?.fg ?? ""}; box-shadow: ${so?.sh ?? ""};`)}>{so?.l}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Trend · 14 days</th>
                          <th className="r">{"Spend & pace"}</th>
                          <th className="r">Delivered</th>
                          <th className="r">Cost / delivered</th>
                          <th className="r">Return rate</th>
                          <th>Real return</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.rows).map((cm, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span style={__sx(`width: 4px; height: 34px; border-radius: var(--radius-sm); background: ${cm?.c ?? ""}; flex-shrink: 0;`)} />
                                  <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e7ebf2", boxShadow: "0 1px 2px rgba(15,23,42,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                                    <img src={cm?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                                  </span>
                                  <div style={{ minWidth: "0" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{cm?.n}</span>
                                      <span style={__sx(`height: 20px; padding: 0 7px; border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; background: ${cm?.sb ?? ""}; color: ${cm?.sf ?? ""};`)}>{cm?.st}</span>
                                    </div>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{cm?.pl} · {cm?.obj}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ width: "120px" }}>
                                <svg width="110" height="28" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                                  <path d={cm?.area} fill={cm?.c} fillOpacity=".12" />
                                  <path d={cm?.line} fill="none" stroke={cm?.c} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                                </svg>
                              </td>
                              <td className="r">
                                <div className="tn" style={{ fontWeight: "var(--weight-medium)" }}>{cm?.sp}</div>
                                <div style={{ width: "90px", height: "4px", borderRadius: "var(--radius-full)", background: "#eef1f6", margin: "5px 0 0 auto", overflow: "hidden" }}>
                                  <div className="gr" style={__sx(`width: ${cm?.pace ?? ""}; height: 100%; background: ${cm?.pc ?? ""};`)} />
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>{cm?.pace} of budget</div>
                              </td>
                              <td className="r">
                                <div className="tn" style={{ fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{cm?.dl}</div>
                                <div className="tn" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>claims {cm?.cl}</div>
                              </td>
                              <td className="r tn">{cm?.cpd}</td>
                              <td className="r">
                                <span className="tn" style={__sx(`color: ${cm?.rtc ?? ""}; font-weight: var(--weight-medium);`)}>{cm?.rt}</span>
                              </td>
                              <td style={{ width: "170px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                    <div className="gr" style={__sx(`width: ${cm?.rw ?? ""}; height: 100%; border-radius: var(--radius-full); background: ${cm?.rc ?? ""};`)} />
                                  </div>
                                  <span className="tn" style={__sx(`font-weight: var(--weight-semibold); color: ${cm?.rc ?? ""}; width: 48px; text-align: right;`)}>{cm?.roas}</span>
                                </div>
                              </td>
                              <td className="r">
                                <button type="button" className="abtn" onClick={cm?.act}>{cm?.actL}</button>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
                {v.is_crea ? (<>
                  <div className="st gc-cols-4" style={{ padding: "18px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.creas).map((cr, $index) => (<React.Fragment key={$index}>
                        <article className="tc lift" style={{ overflow: "hidden", borderRadius: "var(--radius-xl)" }}>
                          <div style={__sx(`position: relative; height: 188px; background: ${cr?.bg ?? ""}; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; color: #fff;`)}>
                            <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.55))" }} />
                            <span style={{ position: "absolute", top: "12px", left: "12px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.95)", color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "var(--weight-medium)", fontSize: "var(--text-xs)" }}>#{cr?.rank}</span>
                            <span style={{ position: "absolute", top: "12px", right: "12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", padding: "4px 9px", borderRadius: "var(--radius-full)", background: "rgba(15,23,42,.5)", backdropFilter: "blur(6px)" }}>{cr?.fmt}</span>
                            <span style={{ position: "relative", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", lineHeight: "20px", letterSpacing: "0" }}>{cr?.hook}</span>
                          </div>
                          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <img src={cr?.lg} alt="" width="18" height="18" style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", flexGrow: "1" }}>{cr?.pl}</span>
                              <span className="tn" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${cr?.rc ?? ""};`)}>{cr?.roas}</span>
                            </div>
                            <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                              <div className="gr" style={__sx(`width: ${cr?.rw ?? ""}; height: 100%; background: ${cr?.rc ?? ""};`)} />
                            </div>
                            <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.ctr}</b>CTR</div>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.dl}</b>Delivered</div>
                              <div><b className="tn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#0f172a" }}>{cr?.sp}</b>Spend</div>
                            </div>
                          </div>
                        </article>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.is_terms ? (<>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Google search term</th>
                          <th>Clicks</th>
                          <th className="r">Cost</th>
                          <th className="r">Delivered</th>
                          <th className="r">Cost / delivered</th>
                          <th>Do this</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.terms).map((tm, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ fontWeight: "var(--weight-medium)" }}>{tm?.t}</td>
                              <td style={{ width: "220px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                    <div className="gr" style={__sx(`width: ${tm?.w ?? ""}; height: 100%; background: #059669; border-radius: var(--radius-full);`)} />
                                  </div>
                                  <span className="tn" style={{ width: "36px", textAlign: "right" }}>{tm?.c}</span>
                                </div>
                              </td>
                              <td className="r tn">{tm?.s}</td>
                              <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{tm?.o}</td>
                              <td className="r tn">{tm?.cpd}</td>
                              <td>
                                <span className="dl" style={__sx(`background: ${tm?.db ?? ""}; color: ${tm?.df ?? ""};`)}>{tm?.d}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
