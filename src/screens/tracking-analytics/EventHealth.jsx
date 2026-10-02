'use client';
// Generated from design/templates/tracking-analytics/EventHealth.dc.html by scripts/convert-design.mjs.
// G1 · Event health & privacy — Tracking & analytics — Event health & privacy.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { TA_PHONE_CSS } from './taPhone';
import { clockNow } from '@/lib/settlements';

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
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, d: Math.abs(p) + '%', db: ok ? 'rgba(16,185,129,.16)' : 'rgba(244,63,94,.16)', df: ok ? '#34d399' : '#fb7185' }; }
function deltaL(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? '#e7f8f1' : '#ffece6', df: ok ? '#047857' : '#be123c' }; }
function tile(l, v, s, c, vals, dp, good) { var sp = sparkP(vals); var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, line: sp.line, area: sp.area, d: dl.d, up: dl.up, db: dl.db, df: dl.df }; }
function dseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--slate-900)' : 'var(--text-on-dark-muted)', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function kfmt(n) { return n >= 100000 ? '৳' + (n / 100000).toFixed(n >= 1000000 ? 1 : 2) + 'L' : n >= 1000 ? '৳' + Math.round(n / 1000) + 'k' : '৳' + Math.round(n); }
var FEED = [['10:42:18', 'Purchase', 'meta', 1, 1, 'ev_GC-24817_pur', 'dedup'], ['10:42:18', 'Purchase', 'google', 1, 1, 'GC-24817', 'ok'], ['10:41:55', 'Order delivered', 'meta', 0, 1, 'ev_GC-24790_del', 'ok'], ['10:41:55', 'Order delivered', 'tiktok', 0, 1, 'ev_GC-24790_del', 'ok'], ['10:41:30', 'Add to cart', 'tiktok', 1, 1, 'ev_c8f2_atc', 'dedup'], ['10:41:12', 'Checkout started', 'meta', 1, 0, 'ev_c8e1_ic', 'browser'], ['10:40:47', 'View content', 'google', 1, 1, 'ev_c8d0_vc', 'ok'], ['10:40:20', 'Order returned', 'meta', 0, 1, 'ev_GC-24611_ret', 'ok'], ['10:39:58', 'Contact', 'meta', 1, 1, 'ev_c8b7_wa', 'dedup'], ['10:39:31', 'Purchase', 'tiktok', 1, 1, 'ev_GC-24816_pur', 'missing']];
var FS = { ok: ['Received', 'var(--fill-success-soft)', 'var(--text-success)'], dedup: ['Counted once', 'var(--fill-info-soft)', 'var(--text-info)'], browser: ['Browser only', 'var(--fill-warning-soft)', 'var(--text-warning)'], missing: ['Missing phone', 'var(--fill-error-soft)', 'var(--text-danger)'] };
var MODES = { opt: ['Ask first', 'Nothing is tracked until the shopper says yes. Safest; fewer events.'], notice: ['Notice only', 'A small note; tracking starts right away. Most shops in Bangladesh use this.'], off: ['No banner', 'Only use this if you do not run ads.'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'health', ff = s.ff || 'all', mode = s.mode || 'notice', share = s.share || {}, fixed = s.fixed || {};
    // demo dates follow today (the token runs out in 6 days; the wishlist event went quiet 2 days ago)
    var dayAt = function (n) { var d = new Date(clockNow() + n * 864e5); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
    var A = [['tok', 'TikTok token expires in 6 days', 'Events will stop on ' + dayAt(6) + ' if it is not renewed.', 'Reconnect', '#fff4e0', '#7a3b04'], ['stop', '“Add to wishlist” stopped firing on Meta', 'Nothing since ' + dayAt(-2) + ', 4:12 PM — the heart button may have changed.', 'Check', '#ffece6', '#9f1239'], ['dup', 'Double counting risk on Google', '14% of purchases arrive twice without the same event ID.', 'Fix', '#fff4e0', '#7a3b04']];
    var srv = series(24, 330, 70, 2, .1), brw = srv.map(function (x, i) { return x * (.72 + .06 * Math.sin(i)); }); var mxv = Math.max.apply(null, srv) * 1.15; var sl = curve(pts(srv, 900, 160, mxv, 0, 15, 2));
    var nOpen = A.filter(function (a) { return !fixed[a[0]]; }).length;
    var v = {
      headline: nOpen ? nOpen + ' issues need a look · 95% of events counted once' : 'All events healthy · 97% counted once',
      tiles: [tile('Events today', '7,990', 'all platforms', '#60a5fa', series(14, 7600, 500, 2, .2), 6), tile('Average match', '8.2 / 10', 'Meta 9.1 · Google 8.4 · TikTok 7.2', '#34d399', series(14, 7.9, .3, 4, .3), 4), tile('Counted once', fixed.dup ? '97%' : '95%', 'deduplication', '#a78bfa', series(14, 93, 1.5, 6, .2), 2), tile('Open issues', String(nOpen), 'alerts to fix', '#fb7185', series(14, 3, 1, 8), nOpen ? 50 : -100, 'down')],
      srvLine: sl, srvArea: sl + ' L900 160 L0 160 Z', brwLine: curve(pts(brw, 900, 160, mxv, 0, 15, 2)),
      tabs: pTabs(self, [{ k: 'health', label: 'Health' }, { k: 'priv', label: 'Consent & privacy' }, { k: 'log', label: 'What was sent where' }], tab, 'tab', { health: A.filter(function (a) { return !fixed[a[0]]; }).length }),
      is_health: tab === 'health', is_priv: tab === 'priv', is_log: tab === 'log',
      alerts: A.filter(function (a) { return !fixed[a[0]]; }).map(function (a) { return { t: a[1], s: a[2], btn: a[3], b: a[4], f: a[5], bd: a[5] === '#9f1239' ? '#fecdd3' : '#fde7c4', go: function () { var n = assign({}, fixed); n[a[0]] = 1; self.setState({ fixed: n }); toast(self, a[0] === 'tok' ? 'TikTok reconnected — token valid for 60 days.' : a[0] === 'stop' ? 'Wishlist event re-linked to the new heart button.' : 'Google now uses the order number as event ID.'); } }; }),
      scores: [['meta', 9.1, 'Great', '96%', '3,420', 'Phone, email, city and click ID sent'], ['google', 8.4, 'Good', fixed.dup ? '99%' : '86%', '2,980', 'Enhanced Conversions on'], ['tiktok', 7.2, 'OK', '91%', '1,610', 'Add email at checkout to raise it']].map(function (x) { var gc = x[1] >= 8 ? 'var(--fill-success)' : 'var(--fill-warning)'; var C = 2 * Math.PI * 42; return assign(plv(x[0]), { q: x[1], ql: x[2], c: PC[x[0]], gc: gc, da: (C * x[1] / 10).toFixed(1) + ' ' + C.toFixed(1), dd: x[3], dc: parseInt(x[3]) < 90 ? 'var(--text-warning)' : 'var(--text-success)', di: parseInt(x[3]) < 90 ? 'triangle-alert' : 'check', dl: parseInt(x[3]) < 90 ? 'below target' : 'on target', sent: x[4], tip: x[5] }); }),
      fOpts: lseg(self, [['all', 'All'], ['meta', 'Meta'], ['google', 'Google'], ['tiktok', 'TikTok']], ff, 'ff'),
      feed: FEED.filter(function (f) { return ff === 'all' || f[2] === ff; }).map(function (f) { var st = FS[f[6]]; return assign(plv(f[2]), { c: PC[f[2]], t: f[0], e: f[1], b: f[3] ? 'check' : 'minus', bl: f[3] ? 'Sent from the browser' : 'Not a browser event', bb: f[3] ? 'var(--fill-success-soft)' : 'var(--slate-100)', bc: f[3] ? 'var(--text-success)' : 'var(--text-muted)', s: f[4] ? 'check' : 'x', sl: f[4] ? 'Sent from the server' : 'Not sent from the server', sb2: f[4] ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', sc: f[4] ? 'var(--text-success)' : 'var(--text-danger)', pi: { ok: 'check', dedup: 'copy-check', browser: 'triangle-alert', missing: 'triangle-alert' }[f[6]], id: f[5], pt: st[0], pb: st[1], pf: st[2] }); }),
      miss: [['Purchase to TikTok · 38 today', 'No phone number — guest checkout skipped it'], ['View content to Google · 4%', 'Missing item price on 6 products'], ['Delivered to Meta · 2 orders', 'Order is older than 7 days — sent as offline event']].map(function (m) { return { t: m[0], s: m[1] }; }),
      queues: [['Delivery events', 'Wait for courier status', '184', '#0f172a'], ['Retry queue', 'Platform did not answer', '3', 'var(--text-warning)'], ['Offline events', 'Late deliveries, sent tonight', '12', '#0f172a']].map(function (q) { return { l: q[0], s: q[1], n: q[2], c: q[3] }; }),
      retry: function () { toast(self, '3 events sent again — all received.'); },
      modes: lseg(self, [['opt', 'Ask first'], ['notice', 'Notice only'], ['off', 'No banner']], mode, 'mode'), modeHelp: MODES[mode][1],
      bText: mode === 'opt' ? 'We use cookies to show you relevant offers and measure our ads. Choose what you allow.' : 'We use cookies to improve the shop and measure our ads. By browsing you agree.', bReject: mode === 'opt',
      gcm: mkSw(this, 'gcm', true), bn: mkSw(this, 'bn', true),
      sharing: [['meta', 'Pixel, Conversions API and catalogue'], ['google', 'Analytics 4, Ads conversions, Merchant Center'], ['tiktok', 'Pixel and Events API']].map(function (x) { var on = share[x[0]] !== false; return assign(plv(x[0]), { s: x[1], aria: 'Share data with ' + PL[x[0]][0], on: on, cls: on ? 'sw on' : 'sw', tog: function () { var n = assign({}, share); n[x[0]] = !on; self.setState({ share: n }); toast(self, on ? 'Nothing goes to ' + PL[x[0]][0] + ' now.' : 'Sharing with ' + PL[x[0]][0] + ' again.', on); } }); }),
      logs: [['10:42:18', 'GC-24817', 'Purchase', 'meta', 'ph: 5e88…a91c · em: 0b4f…77e2 · ct: dhaka', 'Received'], ['10:41:55', 'GC-24790', 'Delivered', 'meta', 'ph: 91c2…04ab · fbc: fb.1.17…', 'Received'], ['10:41:55', 'GC-24790', 'Delivered', 'google', 'ph: 91c2…04ab · gclid: Cj0K…', 'Received'], ['10:40:20', 'GC-24611', 'Returned', 'tiktok', 'ph: 7da1…c3f0 · ttclid: E.C.P…', 'Received'], ['10:39:31', 'GC-24816', 'Purchase', 'tiktok', 'em: — · ph: —', 'Low match'], ['10:31:02', 'GC-24812', 'Confirmed', 'meta', 'ph: 44b0…e11d', 'Retry 1 · received']].map(function (l) { return assign(plv(l[3]), { pc: PC[l[3]], t: l[0], o: l[1], e: l[2], d: l[4], r: l[5], ri: l[5] === 'Received' ? 'check' : 'triangle-alert', c: l[5] === 'Received' ? 'var(--text-success)' : 'var(--text-warning)' }); }),
      csv: function () { toast(self, 'Log for the last 30 days downloaded.'); }
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
@media (max-width:640px){
  /* chart head: the legend gets its own row under the title */
  .eh-bvs{flex-wrap:wrap;row-gap:8px!important}
  .eh-bvs>div:last-child{flex:1 1 100%;flex-wrap:wrap;row-gap:4px}
  .eh-live{flex-wrap:wrap;row-gap:10px!important}
  .eh-live>.lseg{flex:1 1 100%;overflow-x:auto;scrollbar-width:none}
  .eh-live>.lseg::-webkit-scrollbar{display:none}
  .eh-live>.lseg button{flex:none;white-space:nowrap}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class EventHealthScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="EventHealth">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="ta-health" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Tracking & analytics"} page={"Event health & privacy"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"G1 · Event health & privacy"}</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: "0" }}>
                    <__Link href="/pixels-events" className="btn sm" style={{ background: "rgba(255,255,255,.1)", color: "#fff", height: "38px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 4h-7" />
                        <path d="M10 4H3" />
                        <path d="M21 12h-9" />
                        <path d="M8 12H3" />
                        <path d="M21 20h-5" />
                        <path d="M12 20H3" />
                        <path d="M14 2v4" />
                        <path d="M8 10v4" />
                        <path d="M16 18v4" />
                      </svg>
                      <span>{"Pixels & events"}</span>
                    </__Link>
                  </div>
                </div>
                <div className="st gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: var(--radius-full); background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="dl" style={__sx(`background: ${ht?.db ?? ""}; color: ${ht?.df ?? ""};`)}><__Icon name={ht?.up ? "arrow-up" : "arrow-down"} width="12" height="12" aria-hidden="true" /><span className="sr-only">{ht?.up ? "Up " : "Down "}</span>{ht?.d}</span>
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
              </section>
              {v.is_health ? (<>
                <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div className="st gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                    {__list(v.alerts).map((al, $index) => (<React.Fragment key={$index}>
                        <div className="tc" style={__sx(`display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: var(--radius-xl); border-color: ${al?.bd ?? ""};`)}>
                          <span style={__sx(`width: 34px; height: 34px; border-radius: var(--radius-lg); background: ${al?.b ?? ""}; color: ${al?.f ?? ""}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                              <path d="M12 9v4" />
                              <path d="M12 17h.01" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", color: "#0f172a" }}>{al?.t}</div>
                            <div suppressHydrationWarning style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>{al?.s}</div>
                          </div>
                          <button type="button" className="btn solid sm" onClick={al?.go}>{al?.btn}</button>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="st gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.scores).map((sc, $index) => (<React.Fragment key={$index}>
                        <section className="tc lift" style={{ padding: "18px", display: "flex", gap: "18px", alignItems: "center" }}>
                          <div style={{ position: "relative", width: "104px", height: "104px", flexShrink: "0" }}>
                            <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="52" cy="52" r="42" fill="none" stroke="#eef1f6" strokeWidth="9" />
                              <circle className="fadein" cx="52" cy="52" r="42" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={sc?.da} style={{ stroke: sc?.gc }} />
                            </svg>
                            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <span className="tn" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{sc?.q}</span>
                              <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>{sc?.ql}</span>
                            </div>
                          </div>
                          <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <img src={sc?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                              <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{sc?.pl}</span>
                            </div>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "4px" }}>
                                <span>Counted once</span>
                                <b className="tn" title={`Counted once: ${sc?.dl ?? ""}`} style={__sx(`display: inline-flex; align-items: center; gap: 4px; font-weight: var(--weight-semibold); color: ${sc?.dc ?? ""};`)}><__Icon name={sc?.di} width="12" height="12" aria-hidden="true" />{sc?.dd}<span className="sr-only"> ({sc?.dl})</span></b>
                              </div>
                              <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div className="gr" style={__sx(`width: ${sc?.dd ?? ""}; height: 100%; background: ${sc?.dc ?? ""};`)} />
                              </div>
                            </div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><b className="tn" style={{ color: "#0f172a" }}>{sc?.sent}</b> sent today</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "16px" }}>{sc?.tip}</div>
                          </div>
                        </section>
                      </React.Fragment>))}
                  </div>
                  <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div className="eh-bvs" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Browser vs server · last 24 hours</h2>
                      </div>
                      <div style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "#475569" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span aria-hidden="true" style={{ width: "18px", height: "3px", borderRadius: "3px", background: "#2563eb" }} />Server (solid)</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span aria-hidden="true" style={{ width: "18px", borderTop: "2px dashed #b45309" }} />Browser (dashed)</span>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <svg width="100%" height="160" viewBox="0 0 900 160" preserveAspectRatio="none" role="img" aria-label="Events over the last 24 hours: server (solid line) stays above browser (dashed line)" style={{ display: "block" }}>
                        <defs>
                          <linearGradient id="taSrv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2563eb" stopOpacity=".22" />
                            <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" x2="900" y1="15" y2="15" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="65" y2="65" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="115" y2="115" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="158" y2="158" stroke="#eef1f6" />
                        <path d={v.srvArea} fill="url(#taSrv)" />
                        <path className="draw" d={v.srvLine} fill="none" stroke="#2563eb" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                        <path d={v.brwLine} fill="none" stroke="#b45309" strokeWidth="1.8" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      <span>11:00 AM</span>
                      <span>5:00 PM</span>
                      <span>11:00 PM</span>
                      <span>5:00 AM</span>
                      <span>now</span>
                    </div>
                  </section>
                  <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                    <section className="tc" style={{ overflow: "hidden", flexGrow: "1", minWidth: "0" }}>
                      <div className="eh-live" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                        <span className="pulse" role="img" aria-label="Live" title="Live" style={{ width: "9px", height: "9px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", boxShadow: "0 0 0 4px var(--fill-success-soft)" }} />
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", flexGrow: "1" }}>Live events</h2>
                        <div className="lseg" role="group" aria-label="Filter live events by platform">
                          {__list(v.fOpts).map((fo, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={fo?.pick} aria-pressed={fo?.on} style={__sx(`background: ${fo?.bg ?? ""}; color: ${fo?.fg ?? ""}; box-shadow: ${fo?.sh ?? ""};`)}>{fo?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Event</th>
                              <th>Platform</th>
                              <th>Browser</th>
                              <th>Server</th>
                              <th>Event ID</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.feed).map((fd, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td className="tn" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}>{fd?.t}</td>
                                  <td style={{ fontWeight: "var(--weight-medium)" }}>{fd?.e}</td>
                                  <td>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><img src={fd?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{fd?.pl}</span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={__sx(`display: inline-flex; width: 22px; height: 22px; border-radius: var(--radius-full); align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${fd?.bb ?? ""}; color: ${fd?.bc ?? ""};`)}><__Icon name={fd?.b} width="14" height="14" role="img" aria-label={fd?.bl} /></span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={__sx(`display: inline-flex; width: 22px; height: 22px; border-radius: var(--radius-full); align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${fd?.sb2 ?? ""}; color: ${fd?.sc ?? ""};`)}><__Icon name={fd?.s} width="14" height="14" role="img" aria-label={fd?.sl} /></span>
                                  </td>
                                  <td className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fd?.id}</td>
                                  <td>
                                    <span className="dl" style={__sx(`background: ${fd?.pb ?? ""}; color: ${fd?.pf ?? ""};`)}><__Icon name={fd?.pi} width="12" height="12" aria-hidden="true" />{fd?.pt}</span>
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <div className="gc-side" style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Missing details</h2>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {__list(v.miss).map((ms, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #fde7c4", background: "#fffaf0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{ms?.t}</div>
                                <div style={{ fontSize: "var(--text-xs-plus)", color: "#7a3b04" }}>{ms?.s}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Waiting to send</h2>
                          </div>
                          <button type="button" className="abtn" onClick={v.retry}>Retry now</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {__list(v.queues).map((qu, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ flexGrow: "1" }}>
                                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{qu?.l}</div>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{qu?.s}</div>
                                </div>
                                <span className="num" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${qu?.c ?? ""};`)}>{qu?.n}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.is_priv ? (<>
                <div className="fade" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
                  <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Cookie consent</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl" id="eh-mode">Banner mode</span>
                      <div className="lseg" role="group" aria-labelledby="eh-mode">
                        {__list(v.modes).map((mo, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={mo?.pick} aria-pressed={mo?.on} style={__sx(`background: ${mo?.bg ?? ""}; color: ${mo?.fg ?? ""}; box-shadow: ${mo?.sh ?? ""};`)}>{mo?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.modeHelp}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Google consent mode</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Google still gets anonymous signals when someone says no</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.gcm?.on} aria-label="Google consent mode" className={v.gcm?.cls} onClick={v.gcm?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show the banner in Bangla too</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Follows the shopper’s language</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.bn?.on} aria-label="Show the banner in Bangla too" className={v.bn?.cls} onClick={v.bn?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Remember the choice for</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Asked again after</div>
                      </div>
                      <select className="inp" aria-label="Remember" style={{ width: "170px" }}>
                        <option>6 months</option>
                        <option>12 months</option>
                        <option>3 months</option>
                      </select>
                    </div>
                  </section>
                  <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Preview</h2>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#e9eef5", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "300px" }}>
                      <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "0 10px 30px -10px rgba(15,23,42,.35)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>We use cookies</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", lineHeight: "18px" }}>{v.bText}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ flex: "1", height: "36px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>Accept all</span>
                          {v.bReject ? (<>
                            <span style={{ flex: "1", height: "36px", borderRadius: "var(--radius-lg)", border: "1px solid #cbd5e1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>Only needed</span>
                          </>) : null}
                          <span style={{ height: "36px", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", display: "flex", alignItems: "center" }}>Settings</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="tc " style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "0" }}>Data sharing per platform</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {__list(v.sharing).map((sh, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}><img src={sh?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{sh?.pl}</span>
                            <span style={{ flexGrow: "1", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{sh?.s}</span>
                            <button type="button" role="switch" aria-checked={sh?.on} aria-label={sh?.aria} className={sh?.cls} onClick={sh?.tog} />
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                </div>
              </>) : null}
              {v.is_log ? (<>
                <section className="tc fade" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center" }}>
                    <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#475569" }}>Customer details are shown hashed.</span>
                    <button type="button" className="abtn" onClick={v.csv}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>CSV</button>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Sent</th>
                          <th>Order</th>
                          <th>Event</th>
                          <th>Platform</th>
                          <th>Data sent (hashed)</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.logs).map((lg, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td className="tn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{lg?.t}</td>
                              <td className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{lg?.o}</td>
                              <td>{lg?.e}</td>
                              <td>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><img src={lg?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{lg?.pl}</span>
                              </td>
                              <td className="mono" style={{ fontSize: "var(--text-xs)", color: "#475569" }}>{lg?.d}</td>
                              <td style={__sx(`color: ${lg?.c ?? ""}; font-weight: var(--weight-medium); font-size: var(--text-xs-plus);`)}><span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><__Icon name={lg?.ri} width="14" height="14" aria-hidden="true" />{lg?.r}</span></td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>) : null}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
