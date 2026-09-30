'use client';
// Generated from design/templates/tracking-analytics/ProductsTraffic.dc.html by scripts/convert-design.mjs.
// G2 · Products & traffic — Tracking & analytics — Products & traffic.
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
// name, initial, ad spend, delivered, revenue, cogs, delivery+returns
var PR = [['Eid gift box · skincare', 'E', 38400, 236, 231000, 118000, 21700], ['Sunscreen SPF50 50ml', 'S', 23200, 198, 138600, 59400, 16400], ['Galaxy A55 5G · 8/256', 'G', 31800, 42, 1848000, 1722000, 5200], ['Cotton kurti · new drop', 'K', 23500, 119, 116200, 52300, 12900], ['Vitamin C Serum 30ml', 'V', 12600, 74, 70300, 31800, 6100], ['Redmi Note 13', 'R', 16000, 21, 399000, 374000, 3600], ['Bluetooth speaker', 'P', 9100, 38, 57000, 38800, 4400], ['Mango Pickle 400g', 'M', 5400, 61, 21350, 11590, 5200]];
var TT = [['#fff4e0', '#a14f06'], ['#e0f3fb', '#075985'], ['#e0e7ff', '#3730a3'], ['#fce7f3', '#9d174d']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'prod';
    var FUN = [['Sessions', 62400], ['Viewed a product', 28100], ['Added to cart', 5480], ['Started checkout', 2710], ['Placed order', 1420], ['Delivered', 1012]];
    var fp = (function () { var W = 720, Hh = 220, sw = W / 6, top = [], bot = []; FUN.forEach(function (f, k) { var h = Math.max(14, Math.sqrt(f[1] / 62400) * Hh); var y0 = (Hh - h) / 2; top.push([k * sw, y0], [(k + 1) * sw, y0]); bot.push([k * sw, y0 + h], [(k + 1) * sw, y0 + h]); }); var d = 'M' + top.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'); d += ' L' + bot.reverse().map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z'; return d; })();
    var gc = series(30, 330, 60, 3, .25), gi = series(30, 13700, 2600, 7, .35);
    var gp = pts(gc, 900, 180, 480, 0, 20, 10), ip = pts(gi, 900, 180, 21000, 0, 20, 10), gl = curve(gp);
    var v = {
      headline: '৳2,38,060 profit after ads from 8 products',
      tiles: [tile('Sessions', '62,400', 'last 30 days', '#60a5fa', series(14, 2080, 260, 1, .2), 11), tile('Store conversion', '2.28%', 'placed ÷ sessions', '#34d399', series(14, 2.2, .2, 3, .2), 4), tile('Best product', 'Galaxy A55', '৳89,000 profit', '#fbbf24', series(14, 1700, 300, 4, .6), 38), tile('No-result searches', '628', '3 terms', '#fb7185', series(14, 20, 5, 6, .2), 9, 'down'), tile('New followers', '8,330', 'Facebook, Instagram, TikTok', '#a78bfa', series(14, 270, 50, 8, .3), 16)],
      tabs: pTabs(self, [{ k: 'prod', label: 'Profit after ads' }, { k: 'traf', label: 'Traffic & funnel' }, { k: 'soc', label: 'Organic social' }, { k: 'seo', label: 'Google search' }], tab, 'tab'),
      is_prod: tab === 'prod', is_traf: tab === 'traf', is_soc: tab === 'soc', is_seo: tab === 'seo',
      leg: [['Product cost', '#cbd5e1'], ['Delivery & returns', '#94a3b8'], ['Ads', '#f59e0b'], ['Profit', '#10b981']].map(function (x) { return { l: x[0], c: x[1] }; }),
      prods: PR.map(function (p, i) { return [p, i, p[4] - p[5] - p[6] - p[2]]; }).sort(function (a, b) { return b[2] - a[2]; }).map(function (x) { var p = x[0], pr = x[2], t = TT[x[1] % 4], R = p[4]; var vd = pr > 40000 ? ['Scale up', '#e7f8f1', '#047857'] : pr > 0 ? ['Keep', '#e0f2fe', '#075985'] : ['Losing money', '#ffece6', '#be123c'];
        var seg = [['Product cost', p[5], '#cbd5e1'], ['Delivery & returns', p[6], '#94a3b8'], ['Ads', p[2], '#f59e0b'], ['Profit', Math.max(0, pr), '#10b981']].map(function (q) { return { l: q[0], v: bdt(q[1]), c: q[2], w: (q[1] / R * 100) + '%' }; });
        return { n: p[0], i: p[1], tb: t[0], tf: t[1], d: p[3], ad: bdt(p[2]), rev: bdt(R), p: bdt(pr), m: Math.round(pr / R * 100) + '%', pc: pr > 0 ? '#047857' : '#be123c', vt: vd[0], vb: vd[1], vf: vd[2], seg: seg }; }),
      funPath: fp,
      fun: FUN.map(function (f, i2) { var dr = i2 ? 1 - f[1] / FUN[i2 - 1][1] : 0; return { l: f[0], n: f[1].toLocaleString('en-IN'), drop: i2 ? '−' + Math.round(dr * 100) + '% from previous' : '100%', dc: dr > .6 ? '#be123c' : '#64748b' }; }),
      srcs: [['Facebook / Instagram ads', 24800, 692], ['TikTok ads', 11200, 148], ['Google Shopping + Search', 9300, 298], ['Google organic', 8600, 171], ['Direct', 5100, 82], ['Messenger / WhatsApp links', 3400, 29]].map(function (r) { var c = r[2] / r[1] * 100; return { s: r[0], v: r[1].toLocaleString('en-IN'), w: r[1] / 24800 * 100 + '%', c: pct(c), cc: c >= 2.5 ? '#047857' : c >= 1.5 ? '#334155' : '#be123c' }; }),
      lps: [['/offers/eid-gift-box', '8,420', 38, '241'], ['/', '7,960', 44, '122'], ['/p/sunscreen-spf50-50ml', '5,110', 31, '176'], ['/c/phones', '3,880', 52, '58'], ['/lp/kurti-new-drop', '3,240', 41, '97']].map(function (l) { return { p: l[0], s: l[1], b: l[2] + '%', bc: l[2] > 45 ? '#f43f5e' : '#94a3b8', o: l[3] }; }),
      srch: [['sunscreen', 1240, '32 results'], ['kurti', 402, '46 results'], ['a55', 610, '3 results'], ['niacinamide', 288, 'No results'], ['cosrx snail', 196, 'No results'], ['power bank', 144, 'No results']].map(function (q) { var z = q[2] === 'No results'; return { t: q[0], n: q[1], r: q[2], c: z ? '#be123c' : '#047857', bg: z ? '#fff5f5' : '#fff', bd: z ? '#fecdd3' : '#e7ebf2' }; }),
      socs: [['meta', 'Facebook Page', '48,210', 'followers', '+4.6%', [['1.2 M', 'Reach'], ['6.8%', 'Engagement'], ['3,410', 'Website taps'], ['214 / day', 'Profile visits']], 1], ['meta', 'Instagram', '21,630', 'followers', '+6.8%', [['640 K', 'Reach'], ['4.1%', 'Engagement'], ['38', 'Reels'], ['18–24 · 46%', 'Top age']], 4], ['tiktok', 'TikTok', '33,900', 'followers', '+16.5%', [['2.4 M', 'Video views'], ['11 s', 'Average watch'], ['62%', 'From For You'], ['1,120', 'Profile clicks']], 7]].map(function (x) { var sp = sparkP(series(30, 100, 8, x[6], .6)); return { lg: x[1] === 'Instagram' ? '' : LOGO[x[0]], hasLg: x[1] !== 'Instagram', noLg: x[1] === 'Instagram', c: x[1] === 'Instagram' ? '#c026d3' : PC[x[0]], acc: x[1], f: x[2], fl: x[3], g: x[4], line: sp.line, area: sp.area, m: x[5].map(function (y) { return { v: y[0], l: y[1] }; }) }; }),
      gLine: gl, gArea: gl + ' L900 180 L0 180 Z', iLine: curve(ip),
      gsc: [['Clicks', '9,840', 12], ['Impressions', '412 K', 21], ['Click-through', '2.4%', -8], ['Average position', '14.8', 12]].map(function (g) { var d = deltaL(g[2]); return { l: g[0], v: g[1], d: d.d, db: d.db, df: d.df }; }),
      qs: [['gridshop', '2,210', '4,800', '46%', 1.1], ['sunscreen price in bd', '640', '38,200', '1.7%', 6.4], ['eid gift box for her', '302', '8,900', '3.4%', 4.2], ['vitamin c serum bd', '164', '12,700', '1.3%', 8.9], ['korean skincare bd', '410', '29,100', '1.4%', 9.2], ['samsung a55 price in bangladesh', '388', '61,400', '0.6%', 12.8], ['kurti online bd', '210', '22,300', '0.9%', 15.6]].map(function (q) { var top = q[4] <= 3, pg1 = q[4] <= 10; return { q: q[0], c: q[1], i: q[2], r: q[3], p: q[4], pb: top ? '#e7f8f1' : pg1 ? '#e0f2fe' : '#fff4e0', pf: top ? '#047857' : pg1 ? '#075985' : '#a14f06' }; })
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
`;

// ---- markup ----

export default class ProductsTrafficScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ProductsTraffic">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1640px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="ta-products" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb={"Tracking & analytics"} page={"Products & traffic"} placeholder="Search campaign, event or product" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"G2 · Products & traffic · last 30 days"}</div>
                    <h2 style={{ margin: "6px 0 0", fontSize: "26px", lineHeight: "32px", fontWeight: "700", letterSpacing: "-.025em" }}>{v.headline}</h2>
                    <p style={{ margin: "6px 0 0", fontSize: "13.5px", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "640px" }}>Which products earn money after ads, how shoppers move through the store, and how organic reach and Google search are growing.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: "0" }} />
                </div>
                <div className="st" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: 999px; background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "12px", color: "rgba(203,216,238,.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "25px", lineHeight: "30px", fontWeight: "700", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="dl" style={__sx(`background: ${ht?.db ?? ""}; color: ${ht?.df ?? ""};`)}>{ht?.d}</span>
                          <span style={{ fontSize: "11.5px", color: "rgba(203,216,238,.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ht?.s}</span>
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
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
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
                {v.is_prod ? (<>
                  <div style={{ padding: "8px 18px 0", display: "flex", gap: "16px", fontSize: "12px", color: "#475569", alignItems: "center", height: "44px" }}>
                    <span className="ey" style={{ marginRight: "6px" }}>Each ৳100 of revenue goes to</span>
                    {__list(v.leg).map((lg, $index) => (<React.Fragment key={$index}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={__sx(`width: 10px; height: 10px; border-radius: 3px; background: ${lg?.c ?? ""};`)} />{lg?.l}</span>
                      </React.Fragment>))}
                  </div>
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Where revenue goes</th>
                        <th className="r">Revenue</th>
                        <th className="r">Ad spend</th>
                        <th className="r">Profit after ads</th>
                        <th>Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.prods).map((pr, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td style={{ width: "260px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="thumb" style={__sx(`background: ${pr?.tb ?? ""}; color: ${pr?.tf ?? ""}; border: 0;`)}>{pr?.i}</span>
                                <div>
                                  <div style={{ fontWeight: "600", color: "#0f172a" }}>{pr?.n}</div>
                                  <div className="tn" style={{ fontSize: "12px", color: "#64748b" }}>{pr?.d} delivered</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", height: "14px", borderRadius: "999px", overflow: "hidden", background: "#f1f4f9" }}>
                                {__list(pr?.seg).map((sg, $index) => (<React.Fragment key={$index}>
                                    <div className="tt" style={__sx(`width: ${sg?.w ?? ""}; background: ${sg?.c ?? ""};`)}>
                                      <span className="tip">{sg?.l} · {sg?.v}</span>
                                    </div>
                                  </React.Fragment>))}
                              </div>
                            </td>
                            <td className="r tn">{pr?.rev}</td>
                            <td className="r tn" style={{ color: "#b45309" }}>{pr?.ad}</td>
                            <td className="r">
                              <span className="tn" style={__sx(`font-size: 15px; font-weight: 800; color: ${pr?.pc ?? ""};`)}>{pr?.p}</span>
                              <div className="tn" style={{ fontSize: "11.5px", color: "#94a3b8" }}>{pr?.m} margin</div>
                            </td>
                            <td>
                              <span className="dl" style={__sx(`background: ${pr?.vb ?? ""}; color: ${pr?.vf ?? ""};`)}>{pr?.vt}</span>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </>) : null}
                {v.is_traf ? (<>
                  <div className="st" style={{ padding: "18px", display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)", gap: "18px" }}>
                    <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Shopping funnel · Analytics 4</h2>
                          <p style={{ margin: "3px 0 0", fontSize: "12.5px", lineHeight: "18px", color: "#64748b" }}>Biggest leak: product view → add to cart</p>
                        </div>
                      </div>
                      <div>
                        <svg width="100%" height="220" viewBox="0 0 720 220" preserveAspectRatio="none" aria-label="Funnel" style={{ display: "block" }}>
                          <defs>
                            <linearGradient id="taFunG" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0" stopColor="#1e3a8a" />
                              <stop offset="1" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                          <path className="fadein" d={v.funPath} fill="url(#taFunG)" fillOpacity=".92" />
                          <line x1="120" x2="120" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="240" x2="240" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="360" x2="360" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="480" x2="480" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="600" x2="600" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                        </svg>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", marginTop: "10px" }}>
                          {__list(v.fun).map((fn, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "0 6px" }}>
                                <div className="tn" style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{fn?.n}</div>
                                <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "15px" }}>{fn?.l}</div>
                                <div className="tn" style={__sx(`font-size: 11.5px; font-weight: 700; color: ${fn?.dc ?? ""}; margin-top: 3px;`)}>{fn?.drop}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </section>
                    <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Where visitors come from</h2>
                        </div>
                        <span className="ey">Sessions · conv.</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {__list(v.srcs).map((sr, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "5px", fontSize: "13px" }}>
                                <span style={{ flexGrow: "1", fontWeight: "600", color: "#0f172a" }}>{sr?.s}</span>
                                <span className="tn" style={{ color: "#64748b" }}>{sr?.v}</span>
                                <span className="tn" style={__sx(`width: 44px; text-align: right; font-weight: 700; color: ${sr?.cc ?? ""};`)}>{sr?.c}</span>
                              </div>
                              <div style={{ height: "7px", borderRadius: "999px", background: "#f1f4f9", overflow: "hidden" }}>
                                <div className="gr" style={__sx(`width: ${sr?.w ?? ""}; height: 100%; background: #2563eb; border-radius: 999px;`)} />
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                    <section className="tc " style={{ padding: "18px 0 4px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Top landing pages</h2>
                        </div>
                      </div>
                      <table className="tb">
                        <thead>
                          <tr>
                            <th>Page</th>
                            <th className="r">Sessions</th>
                            <th>Bounce</th>
                            <th className="r">Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.lps).map((lp, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td className="mono" style={{ fontSize: "12.5px", color: "#0f172a" }}>{lp?.p}</td>
                                <td className="r tn">{lp?.s}</td>
                                <td style={{ width: "130px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ flexGrow: "1", height: "6px", borderRadius: "999px", background: "#f1f4f9", overflow: "hidden" }}>
                                      <div style={__sx(`width: ${lp?.b ?? ""}; height: 100%; background: ${lp?.bc ?? ""};`)} />
                                    </div>
                                    <span className="tn" style={{ fontSize: "12px", width: "32px", textAlign: "right" }}>{lp?.b}</span>
                                  </div>
                                </td>
                                <td className="r tn" style={{ fontWeight: "700" }}>{lp?.o}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </section>
                    <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Site search</h2>
                        </div>
                        <span className="ey">Red = no results</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {__list(v.srch).map((sq, $index) => (<React.Fragment key={$index}>
                            <span className="tt" style={__sx(`display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid ${sq?.bd ?? ""}; background: ${sq?.bg ?? ""}; font-size: 13px; font-weight: 600; color: #0f172a;`)}>{sq?.t}<span className="tn" style={__sx(`font-size: 11.5px; color: ${sq?.c ?? ""}; font-weight: 700;`)}>{sq?.n}</span><span className="tip">{sq?.r}</span></span>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", background: "#fff5f5", color: "#9f1239", fontSize: "13px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <span><b>3 searches found nothing</b> — 628 people looked for niacinamide, COSRX snail and power banks.</span>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_soc ? (<>
                  <div className="st" style={{ padding: "18px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.socs).map((so, $index) => (<React.Fragment key={$index}>
                        <section className="tc lift" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {so?.hasLg ? (<>
                              <img src={so?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                            </>) : null}
                            {so?.noLg ? (<>
                              <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "linear-gradient(45deg,#f59e0b,#db2777 55%,#7c3aed)", flexShrink: "0" }} />
                            </>) : null}
                            <span style={{ fontSize: "13px", fontWeight: "700", flexGrow: "1" }}>{so?.acc}</span>
                            <span className="dl" style={{ background: "#e7f8f1", color: "#047857" }}>{so?.g}</span>
                          </div>
                          <div>
                            <div className="tn" style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", lineHeight: "38px" }}>{so?.f}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{so?.fl}</div>
                          </div>
                          <svg width="100%" height="70" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true">
                            <path d={so?.area} fill={so?.c} fillOpacity=".12" />
                            <path className="draw" d={so?.line} fill="none" stroke={so?.c} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                          </svg>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#eef1f6", borderRadius: "12px", overflow: "hidden" }}>
                            {__list(so?.m).map((sm, $index) => (<React.Fragment key={$index}>
                                <div style={{ padding: "10px 12px", background: "#fff" }}>
                                  <div className="tn" style={{ fontSize: "15px", fontWeight: "700" }}>{sm?.v}</div>
                                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>{sm?.l}</div>
                                </div>
                              </React.Fragment>))}
                          </div>
                        </section>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.is_seo ? (<>
                  <div className="st" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Google Search · clicks and impressions</h2>
                        </div>
                        <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "#475569" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "3px", background: "#059669", borderRadius: "3px" }} />Clicks</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", borderTop: "2px dashed #7c3aed" }} />Impressions</span>
                        </div>
                      </div>
                      <div style={{ position: "relative" }}>
                        <svg width="100%" height="180" viewBox="0 0 900 180" preserveAspectRatio="none" aria-label="Search trend" style={{ display: "block" }}>
                          <defs>
                            <linearGradient id="taGsc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor="#059669" stopOpacity=".22" />
                              <stop offset="1" stopColor="#059669" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" x2="900" y1="20" y2="20" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="70" y2="70" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="120" y2="120" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="170" y2="170" stroke="#eef1f6" />
                          <path d={v.gArea} fill="url(#taGsc)" />
                          <path className="draw" d={v.gLine} fill="none" stroke="#059669" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                          <path d={v.iLine} fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                        {__list(v.gsc).map((gs, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div className="ey">{gs?.l}</div>
                              <div className="tn" style={{ fontSize: "22px", fontWeight: "800" }}>{gs?.v}</div>
                              <span className="dl" style={__sx(`background: ${gs?.db ?? ""}; color: ${gs?.df ?? ""};`)}>{gs?.d}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                    <section className="tc " style={{ padding: "18px 0 0", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 style={{ margin: "0", fontSize: "15.5px", lineHeight: "22px", fontWeight: "600", color: "#0f172a", letterSpacing: "-.01em" }}>Search queries</h2>
                        </div>
                      </div>
                      <table className="tb">
                        <thead>
                          <tr>
                            <th>Query</th>
                            <th className="r">Clicks</th>
                            <th className="r">Impressions</th>
                            <th className="r">CTR</th>
                            <th>Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.qs).map((gq, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td style={{ fontWeight: "600" }}>{gq?.q}</td>
                                <td className="r tn" style={{ fontWeight: "700" }}>{gq?.c}</td>
                                <td className="r tn" style={{ color: "#64748b" }}>{gq?.i}</td>
                                <td className="r tn">{gq?.r}</td>
                                <td>
                                  <span className="dl" style={__sx(`background: ${gq?.pb ?? ""}; color: ${gq?.pf ?? ""}; min-width: 56px; justify-content: center;`)}>#{gq?.p}</span>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 16px 16px", padding: "12px 14px", borderRadius: "12px", background: "#fff7ed", color: "#9a3412", fontSize: "13px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>7 pages are not indexed — 5 “Crawled, not indexed”, 2 “Duplicate without canonical”.</span>
                        <__Link href="/set-seo" style={{ fontWeight: "700", color: "#9a3412" }}>Fix in SEO</__Link>
                      </div>
                    </section>
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
