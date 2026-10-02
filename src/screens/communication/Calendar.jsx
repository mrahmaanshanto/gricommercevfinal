'use client';
// Generated from design/templates/communication/Calendar.dc.html by scripts/convert-design.mjs.
// Post calendar — Communication — post calendar with month and week views, drafts tray, best-time heat map and per-day details.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ChannelIcon as __ChannelIcon } from '@/components/ui';
import { clockNow } from '@/lib/settlements';
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

// key, name, short, color, auto?, account, status, supports, note
var PLAT = [
  ['fb', 'Facebook Page', 'FB', '#1d4ed8', true, 'GridShop', 'ok', 'Text, photos, videos, links', 'Posts go out at the scheduled minute.'],
  ['ig', 'Instagram', 'IG', '#be185d', true, '@gridshop.bd', 'ok', 'Photos, carousels, Reels', 'Needs a photo or video. Business account linked to the Facebook Page.'],
  ['wa', 'WhatsApp broadcast', 'WA', '#15803d', true, '+880 1711-482093', 'ok', 'Template message with photo', 'Goes only to customers who opted in. ৳1.10 per message from the wallet.'],
  ['tt', 'TikTok', 'TT', '#0f172a', true, '@gridshop', 'renew', 'Videos, photo posts', 'Access expires in 3 days. Reconnect to keep posting.'],
  ['yt', 'YouTube', 'YT', '#b91c1c', true, 'GridShop BD', 'ok', 'Videos and Shorts', 'Needs a video.'],
  ['x', 'X', 'X', '#334155', true, '@gridshopbd', 'off', 'Text up to 280 characters, photos', 'How many posts a month depends on the X API plan.'],
  ['pin', 'Pinterest', 'PIN', '#9f1239', true, 'Not connected', 'off', 'Pins with photo and link', 'Each pin needs a photo and a link.'],
  ['wac', 'WhatsApp Channel', 'WAC', '#166534', false, 'GridShop Offers', 'manual', 'Reminder with the text ready to copy', 'WhatsApp has no posting API for channels, so a reminder is sent to post by hand.'],
  ['fbg', 'Facebook groups', 'FBG', '#1e40af', false, '3 groups', 'manual', 'Reminder with the text ready to copy', 'Meta closed group posting by API in 2024, so a reminder is sent to post by hand.'],
  ['li', 'LinkedIn page', 'IN', '#075985', true, 'GridShop Ltd', 'ok', 'Text, photos, links', 'Company page only, not personal profiles.']
];
var PST = { ok: ['Connected', '#e7f8f1', '#047857'], renew: ['Reconnect soon', '#fff4e0', '#a14f06'], off: ['Not connected', '#f1f5f9', '#475569'], manual: ['Reminder only', 'rgba(0,48,135,.08)', '#003087'] };
// platform key -> ChannelIcon channel
var CH = { fb: 'facebook', ig: 'instagram', wa: 'whatsapp', tt: 'tiktok', yt: 'youtube', x: 'x', pin: 'pinterest', wac: 'whatsapp', fbg: 'facebook', li: 'linkedin' };
var ST_ICON = { sched: 'clock', remind: 'bell', done: 'check', draft: 'pencil' };
function plat(k) { return PLAT.filter(function (p) { return p[0] === k; })[0]; }

// id, y, m(0-based), d, hour(24), title, platforms, status
var POSTS = [
  ['s1', 2026, 8, 24, 20, 'Weekend deal: bumper cases', ['fb', 'ig'], 'done'], ['s2', 2026, 8, 27, 20, 'Customer review video', ['tt', 'ig'], 'done'], ['s3', 2026, 8, 29, 21, 'Puja collection teaser', ['fb', 'ig', 'tt'], 'sched'],
  ['a', 2026, 9, 1, 20, 'Puja offer: 10% off chargers', ['fb', 'ig', 'wa', 'tt', 'wac'], 'sched'], ['b', 2026, 9, 3, 20, 'Case drop test video', ['tt', 'yt', 'ig'], 'sched'],
  ['c', 2026, 9, 5, 10, 'PUJA10 reminder', ['wa'], 'sched'], ['d', 2026, 9, 8, 10, 'Blog: Puja offers', ['fb', 'li'], 'sched'], ['e', 2026, 9, 8, 19, 'Offer post for the channel', ['wac'], 'remind'],
  ['f', 2026, 9, 10, 18, 'Share in Dhaka gadget groups', ['fbg'], 'remind'], ['h', 2026, 9, 15, 20, 'Reel: 3 ways to protect a phone', ['ig', 'tt', 'yt'], 'sched'],
  ['j', 2026, 9, 20, 21, 'Offer ends tonight', ['fb', 'wa', 'wac', 'fbg'], 'sched'], ['k', 2026, 9, 22, 20, 'Uttara branch opening soon', ['fb', 'ig', 'li'], 'sched'],
  ['m', 2026, 9, 28, 20, 'Weekend deal preview', ['fb', 'ig', 'tt'], 'sched'], ['n', 2026, 9, 30, 19, 'Month-end best sellers', ['fb', 'ig', 'li'], 'sched']
];
var DRAFTS = [['g', 'New MagSafe cases', ['ig', 'pin', 'fb'], 'Photo ready · no date', 12, 21], ['i', 'Last days of PUJA10', ['fb', 'ig', 'wa', 'x'], 'Needs X connected', 18, 11], ['l', 'Customer reviews roundup', ['fb', 'ig'], 'Text only', 25, 20]];
var ST = { sched: ['Scheduled', '#e0f2fe', '#075985', '#0ea5e9'], remind: ['Reminder', 'rgba(0,48,135,.08)', '#003087', '#6366f1'], done: ['Posted', '#e7f8f1', '#047857', '#10b981'], draft: ['Draft', '#f1f5f9', '#475569', '#94a3b8'] };
var WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// Today comes from the app clock (clockNow) after mount; the first render (server and hydration) uses 1 Oct 2026.
var TODAY0 = [2026, 9, 1];
function todayNow() { var d = new Date(clockNow()); return [d.getFullYear(), d.getMonth(), d.getDate()]; }
var HM = [[1, 1, 1, 1, 1, 2, 2], [2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 3, 4], [3, 3, 3, 3, 3, 4, 4], [4, 3, 3, 3, 4, 4, 3]];
var HML = ['9:00 AM', '12:00 PM', '3:00 PM', '8:00 PM', '10:00 PM'], HMS = ['9 AM', '12 PM', '3 PM', '8 PM', '10 PM'], HMC = ['#eef2f7', '#c7d4ea', '#8fa6d2', '#4c6fb3', '#003087'];
function h12(h) { return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
class Component extends DCLogic {
  componentDidMount() { this.setState({ today: todayNow() }); }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var TODAY = s.today || TODAY0;
    var ym = s.ym || [TODAY[0], TODAY[1]], f = s.f || 'all', view = s.view || 'month';
    var sel = s.sel || TODAY.slice();
    var moved = s.moved || {}, placed = s.placed || {}, dups = s.dups || [];
    var all = POSTS.map(function (p) { var q = p.slice(); if (moved[p[0]]) { q[1] = moved[p[0]][0]; q[2] = moved[p[0]][1]; q[3] = moved[p[0]][2]; } return q; })
      .concat(DRAFTS.filter(function (d) { return placed[d[0]]; }).map(function (d) { return [d[0], 2026, 9, d[4], d[5], d[1], d[2], 'draft']; })).concat(dups);
    var posts = all.filter(function (p) { return f === 'all' || p[6].indexOf(f) >= 0; });
    function on(y, m, d) { return posts.filter(function (p) { return p[1] === y && p[2] === m && p[3] === d; }).sort(function (a, b) { return a[4] - b[4]; }); }
    function card(p) { var names = p[6].map(function (k) { return plat(k)[1]; }); var full = p[5] + ', ' + h12(p[4]) + ', ' + ST[p[7]][0] + ', on ' + names.join(', ');
      return { t: p[5], time: h12(p[4]), sc: ST[p[7]][3], si: ST_ICON[p[7]], full: full, extra: p[6].length > 4 ? '+' + (p[6].length - 4) : '', pl: p[6].slice(0, 4).map(function (k) { var q = plat(k); return { ch: CH[k], n: q[1] }; }),
        pick: function () { self.setState({ sel: [p[1], p[2], p[3]] }); } }; }
    function nextDay(y, m, d) { var dt = new Date(y, m, d + 1); return [dt.getFullYear(), dt.getMonth(), dt.getDate()]; }
    var y = ym[0], m = ym[1];
    var first = new Date(y, m, 1).getDay(), lead = (first + 1) % 7, days = new Date(y, m + 1, 0).getDate();
    var cells = [];
    for (var i = 0; i < lead; i++) { var dt = new Date(y, m, i - lead + 1); cells.push([dt.getFullYear(), dt.getMonth(), dt.getDate(), true]); }
    for (var d = 1; d <= days; d++) cells.push([y, m, d, false]);
    while (cells.length % 7) { var dt2 = new Date(y, m, days + (cells.length - lead - days) + 1); cells.push([dt2.getFullYear(), dt2.getMonth(), dt2.getDate(), true]); }
    var monthPosts = posts.filter(function (p) { return p[1] === y && p[2] === m; });
    var isT = function (c) { return c[0] === TODAY[0] && c[1] === TODAY[1] && c[2] === TODAY[2]; };
    var isS = function (c) { return c[0] === sel[0] && c[1] === sel[1] && c[2] === sel[2]; };
    // week containing sel (Saturday start)
    var sd = new Date(sel[0], sel[1], sel[2]); var back = (sd.getDay() + 1) % 7; var ws = new Date(sel[0], sel[1], sel[2] - back);
    var week = []; for (var k = 0; k < 7; k++) { var w = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + k); week.push([w.getFullYear(), w.getMonth(), w.getDate()]); }
    var cur = on(sel[0], sel[1], sel[2]);
    var v = {
      title: view === 'month' ? MON[m] + ' ' + y : 'Week of ' + week[0][2] + ' ' + MON[week[0][1]].slice(0, 3) + ' – ' + week[6][2] + ' ' + MON[week[6][1]].slice(0, 3),
      summary: monthPosts.length + ' posts in ' + MON[m] + ' · ' + monthPosts.filter(function (p) { return p[7] === 'sched'; }).length + ' scheduled · ' + monthPosts.filter(function (p) { return p[7] === 'remind'; }).length + ' reminders · weeks start on Saturday',
      views: lseg(self, [['month', 'Month'], ['week', 'Week']], view, 'view'), isMonth: view === 'month', isWeek: view === 'week',
      prev: function () { if (view === 'week') { var p = new Date(sel[0], sel[1], sel[2] - 7); self.setState({ sel: [p.getFullYear(), p.getMonth(), p.getDate()], ym: [p.getFullYear(), p.getMonth()] }); } else { var n = new Date(y, m - 1, 1); self.setState({ ym: [n.getFullYear(), n.getMonth()] }); } },
      next: function () { if (view === 'week') { var p = new Date(sel[0], sel[1], sel[2] + 7); self.setState({ sel: [p.getFullYear(), p.getMonth(), p.getDate()], ym: [p.getFullYear(), p.getMonth()] }); } else { var n = new Date(y, m + 1, 1); self.setState({ ym: [n.getFullYear(), n.getMonth()] }); } },
      today: function () { self.setState({ ym: [TODAY[0], TODAY[1]], sel: TODAY.slice() }); },
      filters: [{ k: 'all', l: 'All', s: 'ALL', c: '#64748b' }].concat(PLAT.map(function (p) { return { k: p[0], l: p[1].replace(' broadcast', '').replace(' page', '').replace('Facebook Page', 'Facebook'), s: p[2], c: p[3] }; })).map(function (x) { var o = x.k === f; return { l: x.l, ch: CH[x.k], on: o, cls: o ? 'chip on' : 'chip', pick: function () { self.setState({ f: x.k }); } }; }),
      legend: ['sched', 'remind', 'done', 'draft'].map(function (k) { return { l: ST[k][0], c: ST[k][2], i: ST_ICON[k] }; }),
      wd: WD.map(function (w) { return { l: w, s: w.charAt(0), off: w === 'Fri', c: w === 'Fri' ? 'var(--text-warning)' : 'var(--text-muted)' }; }),
      cells: cells.map(function (c, idx) { var ev = on(c[0], c[1], c[2]); var t = isT(c), sl = isS(c); var fri = idx % 7 === 6;
        return { n: String(c[2]), op: c[3] ? .4 : 1, nb: t ? '#003087' : 'transparent', nc: t ? '#fff' : '#0f172a', bg: sl ? '#f3f6fc' : fri ? '#fffbf5' : '#fff', cls: sl ? 'dc on' : 'dc',
          aria: c[2] + ' ' + MON[c[1]] + (fri ? ', weekend' : '') + ', ' + ev.length + (ev.length === 1 ? ' post' : ' posts') + (sl ? ', selected' : ''), sel: sl, ev: ev.slice(0, 2).map(card), dots: ev.slice(0, 3).map(function (p) { return ST[p[7]][2]; }), dotMore: ev.length > 3 ? '+' + (ev.length - 3) : '', more: ev.length > 2, moreL: '+' + (ev.length - 2) + ' more', moreAria: 'Show all ' + ev.length + ' posts on ' + c[2] + ' ' + MON[c[1]],
          pick: function () { self.setState({ sel: [c[0], c[1], c[2]] }); } }; }),
      wkHead: week.map(function (w) { var t = isT(w); return { d: WD[week.indexOf(w)], n: String(w[2]), c: t ? '#003087' : '#0f172a' }; }),
      wkRows: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(function (h) { return { h: h12(h), c: week.map(function (w, i) { return { bg: i === 6 ? '#fffbf5' : '#fff', ev: on(w[0], w[1], w[2]).filter(function (p) { return p[4] === h; }).map(function (p) { return { t: p[5], time: h12(p[4]), n: p[6].length, full: card(p).full, pick: card(p).pick, sc: ST[p[7]][3], bg: p[7] === 'done' ? '#ecfdf5' : p[7] === 'remind' ? '#eef2ff' : p[7] === 'draft' ? '#f1f5f9' : '#eaf5fd' }; }) }; }) }; }),
      selTitle: sel[2] + ' ' + MON[sel[1]] + (isT(sel) ? ' · today' : ''), selSub: cur.length ? cur.length + (cur.length === 1 ? ' post' : ' posts') : 'No posts',
      selPosts: cur.map(function (p) { var b = ST[p[7]]; return { time: h12(p[4]), t: p[5], st: b[0], bb: b[1], bf: b[2], si: ST_ICON[p[7]], pl: p[6].map(function (k) { var q = plat(k); return { n: q[1], ch: CH[k] }; }),
        dup: function () { var nd = nextDay(p[1], p[2], p[3] + 6); self.setState({ dups: dups.concat([['dup' + dups.length, nd[0], nd[1], nd[2], p[4], p[5] + ' (repeat)', p[6], 'draft']]) }); toast(self, 'Copied as a draft one week later, ' + nd[2] + ' ' + MON[nd[1]] + '.'); },
        move: function () { var nd = nextDay(p[1], p[2], p[3]); var n = assign({}, moved); n[p[0]] = nd; self.setState({ moved: n, sel: nd, ym: [nd[0], nd[1]] }); toast(self, '“' + p[5] + '” moved to ' + nd[2] + ' ' + MON[nd[1]] + ', same time.'); } }; }),
      noPosts: cur.length === 0,
      drafts: DRAFTS.filter(function (d) { return !placed[d[0]]; }).map(function (d) { return { t: d[1], m: d[3] + ' · ' + d[2].length + ' places', day: d[4] + ' Oct', place: function () { var n = assign({}, placed); n[d[0]] = 1; self.setState({ placed: n, sel: [2026, 9, d[4]], ym: [2026, 9] }); toast(self, '“' + d[1] + '” added to ' + d[4] + ' October as a draft.'); } }; }),
      noDrafts: DRAFTS.every(function (d) { return placed[d[0]]; }),
      hmHead: WD.map(function (w) { return w.slice(0, 2); }),
      hm: HM.map(function (r, i) { return { l: HMS[i], c: r.map(function (x, j) { return { bg: HMC[x], t: WD[j] + ' ' + HML[i] }; }) }; }),
      bestNote: 'Best: Thursday and Friday at 8:00 PM. Quietest: mornings before 10:00 AM.'
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `@media (max-width:640px){.dn{width:34px !important;height:34px !important}}

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
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}.badge.sb::before{display:none}
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

.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
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
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.dc{position:relative;overflow:hidden;min-height:148px;padding:8px;border-right:1px solid #eef1f6;border-bottom:1px solid #eef1f6;background:#fff;text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.dc:hover{background:#f8fafd}.dc.on{background:#f3f6fc;box-shadow:inset 0 0 0 2px #003087}
.dn{border:0;padding:0;font:inherit;cursor:pointer}.dn::after{content:"";position:absolute;inset:0}.dn:focus-visible{outline:0}.dn:focus-visible::after{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.more{position:relative;z-index:1;border:0;background:transparent;padding:2px 4px;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer;border-radius:var(--radius-sm)}.more:hover{text-decoration:underline}
.pc:focus-visible,.wev:focus-visible,.more:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:1px}
.dn{width:26px;height:26px;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.pc{position:relative;z-index:1;display:flex;flex-direction:column;gap:3px;padding:5px 7px;border:0;border-radius:var(--radius-lg);border-left:3px solid;background:#f7f9fc;min-width:0;width:100%;max-width:100%;overflow:hidden;font:inherit;text-align:left;cursor:pointer}
.pc:hover{background:#eef3fa}
.pc .t{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);color:#0f172a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.stack{display:flex;align-items:center;gap:2px;flex-wrap:wrap}
.pd{width:24px;height:24px;border-radius:var(--radius-full);background:var(--slate-500);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.wk{display:grid;grid-template-columns:56px repeat(7,minmax(0,1fr))}
.wcell{position:relative;height:44px;border-right:1px solid #f1f4f8;border-bottom:1px solid #f1f4f8}
.wev{position:absolute;left:4px;right:4px;top:3px;z-index:1;padding:5px 7px;border:0;border-radius:var(--radius-lg);border-left:3px solid;background:#eef3ff;font:inherit;font-size:var(--text-xs);line-height:17px;color:#0f172a;overflow:hidden;text-align:left;cursor:pointer}
.hm{width:100%;aspect-ratio:1.6;border-radius:var(--radius-sm)}
.cal-chips{display:contents}
.dc-dots,.wd-s{display:none}
/* phones: title and arrows share a row; filters are one swipe row; the month grid shows a dot per post
   (tap a day: its posts are listed under the calendar); single-letter weekdays; the week view scrolls sideways */
@media (max-width:640px){
  .cal-head{gap:8px!important}
  .gc-shell__content .cal-head>.cal-title{flex:1 1 calc(100% - 96px)!important;order:-1}
  .cal-head>.cal-arrows{align-self:flex-start;margin-left:auto}
  .cal-filters{row-gap:8px!important}
  .cal-chips{display:flex;gap:6px;flex:1 1 100%;min-width:0;overflow-x:auto;scrollbar-width:none;margin-inline:-14px;padding:0 14px 2px;scroll-padding-inline:14px}
  .cal-chips::-webkit-scrollbar{display:none}
  .cal-chips>.chip{flex:none}
  .cal-filters>.cal-gap{display:none}
  .wd{position:relative;padding:8px 0!important;text-align:center}
  .wd-l{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .wd-s{display:inline}
  .dc{min-height:56px;padding:4px 2px 6px;align-items:center;gap:4px}
  .dc>.pc,.dc>.more{display:none}
  .dc-dots{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:3px;max-width:100%;font-size:var(--text-2xs);line-height:1;color:var(--text-muted)}
  .dc-dots i{width:6px;height:6px;border-radius:var(--radius-full)}
  .dc-dots b{font-weight:var(--weight-medium)}
  .cal-box{overflow-x:auto!important}
  .cal-box>.wk{min-width:600px}
}
`;

// ---- markup ----

export default class CalendarScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Calendar">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="comm-cal" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Communication" page="Post calendar" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div className="cal-head" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="cal-arrows" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button type="button" className="ib" aria-label="Previous month" onClick={v.prev}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="ib" aria-label="Next month" onClick={v.next}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div className="cal-title" style={{ flexGrow: "1" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "var(--tracking-tight)" }}>{v.title}</h1>
                  <p className="sub">{v.summary}</p>
                </div>
                <button type="button" className="btn line sm" onClick={v.today}>Today</button>
                <div className="lseg" role="radiogroup" aria-label="View">
                  {__list(v.views).map((m, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                    </React.Fragment>))}
                </div>
                <__Link href="/connections?group=social" className="abtn" style={{ textDecoration: "none" }}>Connections</__Link>
                <__Link href="/composer" className="btn solid sm">Create post</__Link>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="cal-filters" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                <div className="cal-chips">
                {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={f?.cls} aria-pressed={f?.on} onClick={f?.pick} style={{ height: "32px", fontSize: "var(--text-xs)", padding: "0 10px 0 4px" }}>{f?.ch ? <__ChannelIcon channel={f.ch} size={24} label="" /> : <span className="pd" aria-hidden="true"><__Icon name="layout-grid" width="14" height="14" /></span>}{f?.l}</button>
                  </React.Fragment>))}
                </div>
                <span className="cal-gap" style={{ flexGrow: "1" }} />
                {__list(v.legend).map((g, $index) => (<React.Fragment key={$index}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-body)" }}><__Icon name={g?.i} width="14" height="14" aria-hidden="true" style={{ color: g?.c }} />{g?.l}</span>
                  </React.Fragment>))}
              </div>
              <section className="tc cal-box" style={{ overflow: "hidden" }}>
                {v.isMonth ? (<>
                  <div className="cal" style={{ background: "#fbfcfe", borderBottom: "1px solid #eef1f6" }}>
                    {__list(v.wd).map((w, $index) => (<React.Fragment key={$index}>
                        <div className="wd" style={__sx(`padding: 10px; font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${w?.c ?? ""};`)}><span className="wd-l">{w?.l}{w?.off ? <span style={{ fontWeight: "var(--weight-regular)" }}> · weekend</span> : null}</span><span className="wd-s" aria-hidden="true">{w?.s}</span></div>
                      </React.Fragment>))}
                  </div>
                  <div className="cal">
                    {__list(v.cells).map((d, $index) => (<React.Fragment key={$index}>
                        <div className={d?.cls} style={__sx(`background: ${d?.bg ?? ""};`)}>
                          <button type="button" className="dn" onClick={d?.pick} aria-label={d?.aria} aria-pressed={d?.sel} style={__sx(`background: ${d?.nb ?? ""}; color: ${d?.nc ?? ""}; opacity: ${d?.op ?? ""};`)}>{d?.n}</button>
                          {d?.dots?.length ? (<span className="dc-dots" aria-hidden="true">{d.dots.map((c, i) => <i key={i} style={{ background: c }} />)}{d.dotMore ? <b>{d.dotMore}</b> : null}</span>) : null}
                          {__list(d?.ev).map((e, $index) => (<React.Fragment key={$index}>
                              <button type="button" className="pc" onClick={e?.pick} aria-label={e?.full} title={e?.full} style={__sx(`border-left-color: ${e?.sc ?? ""};`)}>
                                <span className="t">{e?.t}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                  <span className="stack" aria-hidden="true">
                                    {__list(e?.pl).map((x, $index) => (<React.Fragment key={$index}>
                                        <__ChannelIcon channel={x?.ch} size={16} label={x?.n} />
                                      </React.Fragment>))}
                                    {e?.extra ? <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{e.extra}</span> : null}
                                  </span>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name={e?.si} width="12" height="12" aria-hidden="true" />{e?.time}</span>
                                </span>
                              </button>
                            </React.Fragment>))}
                          {d?.more ? (<>
                            <button type="button" className="more" onClick={d?.pick} aria-label={d?.moreAria}>{d?.moreL}</button>
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.isWeek ? (<>
                  <div className="wk" style={{ background: "#fbfcfe", borderBottom: "1px solid #eef1f6" }}>
                    <div />
                    {__list(v.wkHead).map((h, $index) => (<React.Fragment key={$index}>
                        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{h?.d}</span>
                          <span style={__sx(`font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${h?.c ?? ""};`)}>{h?.n}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="wk">
                    {__list(v.wkRows).map((r, $index) => (<React.Fragment key={$index}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", padding: "2px 8px 0 0", textAlign: "right", borderBottom: "1px solid #f1f4f8" }}>{r?.h}</div>
                        {__list(r?.c).map((c, $index) => (<React.Fragment key={$index}>
                            <div className="wcell" style={__sx(`background: ${c?.bg ?? ""};`)}>
                              {__list(c?.ev).map((e, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className="wev" onClick={e?.pick} aria-label={e?.full} title={e?.full} style={__sx(`border-left-color: ${e?.sc ?? ""}; background: ${e?.bg ?? ""};`)}>
                                    <span style={{ display: "block", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e?.t}</span>
                                    <span style={{ display: "block", color: "var(--text-body)" }}>{e?.time} · {e?.n} places</span>
                                  </button>
                                </React.Fragment>))}
                            </div>
                          </React.Fragment>))}
                      </React.Fragment>))}
                  </div>
                </>) : null}
              </section>
              <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px 10px" }}>
                    <h2 className="h2">{v.selTitle}</h2>
                    <p className="sub">{v.selSub}</p>
                  </div>
                  {__list(v.selPosts).map((p, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 18px", borderTop: "1px solid #f1f4f8" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="tn" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{p?.time}</span>
                          <span className="badge sb" style={__sx(`background: ${p?.bb ?? ""}; color: ${p?.bf ?? ""};`)}><__Icon name={p?.si} width="12" height="12" aria-hidden="true" />{p?.st}</span>
                        </div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{p?.t}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px" }}>
                          {__list(p?.pl).map((x, $index) => (<React.Fragment key={$index}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-body)" }}><__ChannelIcon channel={x?.ch} size={18} label="" />{x?.n}</span>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <__Link href="/composer" className="abtn" style={{ textDecoration: "none" }}>Edit</__Link>
                          <button type="button" className="abtn" onClick={p?.dup}>Duplicate</button>
                          <button type="button" className="abtn" onClick={p?.move}>Next day</button>
                        </div>
                      </div>
                    </React.Fragment>))}
                  {v.noPosts ? (<>
                    <div style={{ padding: "4px 18px 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Nothing on this day. <__Link href="/composer">Create a post</__Link>.</div>
                  </>) : null}
                </section>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px 10px" }}>
                    <h2 className="h2">Drafts tray</h2>
                    <p className="sub">Not on the calendar yet.</p>
                  </div>
                  {__list(v.drafts).map((d, $index) => (<React.Fragment key={$index}>
                      <div className="chk" style={{ padding: "10px 18px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d?.t}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{d?.m}</div>
                        </div>
                        <button type="button" className="abtn" onClick={d?.place}>Add to {d?.day}</button>
                      </div>
                    </React.Fragment>))}
                  {v.noDrafts ? (<>
                    <div style={{ padding: "0 18px 14px", fontSize: "var(--text-xs-plus)", color: "var(--text-success)" }}>Every draft is on the calendar.</div>
                  </>) : null}
                </section>
                <section className="tc sec">
                  <div>
                    <h2 className="h2">Best times to post</h2>
                    <p className="sub">Darker means more engagement in September. Dhaka time.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "42px repeat(7, minmax(0, 1fr))", gap: "4px", alignItems: "center" }}>
                    <span />
                    {__list(v.hmHead).map((h, $index) => (<React.Fragment key={$index}>
                        <span style={{ fontSize: "var(--text-2xs)", textAlign: "center", color: "var(--text-muted)" }}>{h}</span>
                      </React.Fragment>))}
                    {__list(v.hm).map((r, $index) => (<React.Fragment key={$index}>
                        <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{r?.l}</span>
                        {__list(r?.c).map((c, $index) => (<React.Fragment key={$index}>
                            <span className="hm" title={c?.t} style={__sx(`background: ${c?.bg ?? ""};`)} />
                          </React.Fragment>))}
                      </React.Fragment>))}
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "#475569" }}>{v.bestNote}</span>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
