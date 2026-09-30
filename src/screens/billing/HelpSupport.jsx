'use client';
// Generated from design/templates/billing/HelpSupport.dc.html by scripts/convert-design.mjs.
// Help & support — Settings — support tickets to GridCommerce with the full communication history.
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

var CATS = ['Billing and payments', 'WordPress sync', 'AI auto-call', 'Courier integration', 'Tracking and pixels', 'Account and access', 'Something else'];
var T = [
  { id: 'GC-T-2291', s: 'WooCommerce stock not updating for variants', c: 'WordPress sync', st: 'open', u: '12 min ago', o: '29 Sep, 10:05 AM', agent: 'Rafiq, integrations', m: [
    ['me', 'Stock changes made in GridCommerce are not reaching WooCommerce for products with size variants. Simple products work.', '10:05 AM'],
    ['event', 'Call from GridCommerce support · 6 min', '10:40 AM'],
    ['them', 'Thanks for the call. The variants were created in WooCommerce before the connection, so their IDs were not matched. A re-match is running now.', '10:52 AM'],
    ['them', 'Re-match finished: 38 of 38 variants linked. Please change one stock value and check WooCommerce.', '2:48 PM']] },
  { id: 'GC-T-2284', s: 'Refund for duplicate SSLCOMMERZ charge', c: 'Billing and payments', st: 'waiting', u: 'yesterday', o: '28 Sep, 4:12 PM', agent: 'Nabila, billing', m: [
    ['me', 'The wallet top-up of ৳1,000 was charged twice on 28 Sep. Only one top-up shows in the wallet.', '4:12 PM'],
    ['them', 'Confirmed with SSLCOMMERZ: the second charge was not settled. It returns to the card in 7 to 10 working days. We will close this once it lands.', '6:30 PM'],
    ['event', 'Email sent · refund reference SSL-RF-51920', '6:31 PM']] },
  { id: 'GC-T-2240', s: 'AI calls in Bangla sound too fast', c: 'AI auto-call', st: 'solved', u: '22 Sep', o: '21 Sep, 1:15 PM', agent: 'Tanim, AI team', m: [
    ['me', 'Customers say the Bangla call voice speaks too fast.', '1:15 PM'],
    ['them', 'Voice speed is now in AI auto-call settings. It is set to 0.9× for this store.', '22 Sep, 11:02 AM']] },
  { id: 'GC-T-2197', s: 'Add a second POS counter', c: 'Account and access', st: 'solved', u: '14 Sep', o: '13 Sep, 7:40 PM', agent: 'Nabila, billing', m: [
    ['me', 'Please add a second counter to the POS register for Mirpur.', '7:40 PM'], ['them', 'Added. It is billed from the next renewal.', '14 Sep, 10:10 AM']] }
];
var STL = { open: ['Open', '#e0f2fe', '#075985'], waiting: ['Waiting on refund', '#fff4e0', '#a14f06'], solved: ['Solved', '#e7f8f1', '#047857'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tickets = (s.added || []).concat(T).map(function (t) { var o = assign({}, t); if (s.st && s.st[t.id]) o.st = s.st[t.id]; o.m = t.m.concat((s.extra || {})[t.id] || []); return o; });
    var f = s.f || 'active', sel = s.sel || tickets[0].id;
    var shown = tickets.filter(function (t) { return f === 'all' || (f === 'active' ? t.st !== 'solved' : t.st === 'solved'); });
    var cur = tickets.filter(function (t) { return t.id === sel; })[0] || tickets[0];
    var b = STL[cur.st];
    var cnt = { active: tickets.filter(function (t) { return t.st !== 'solved'; }).length, solved: tickets.filter(function (t) { return t.st === 'solved'; }).length, all: tickets.length };
    var v = {
      headline: cnt.active + ' open tickets · usual first reply under 2 hours',
      tiles: [{ l: 'Open', v: String(cnt.active), s: '1 waiting on a refund', c: '#60a5fa' }, { l: 'Solved this year', v: '14', s: 'average 5 hours to solve', c: '#34d399' }, { l: 'Support phone', v: '09678-120120', s: 'Sat–Thu, 9:00 AM – 9:00 PM', c: '#a78bfa' }, { l: 'Account manager', v: 'Nabila', s: 'billing and plan changes', c: '#fbbf24' }],
      composing: !!s.compose, cats: CATS, subj: s.subj || '', body: s.body || '',
      onCat: function (e) { self.setState({ cat: val(e) }); }, onSubj: function (e) { self.setState({ subj: val(e) }); }, onBody: function (e) { self.setState({ body: val(e) }); },
      newT: function () { self.setState({ compose: true }); }, cancelT: function () { self.setState({ compose: false }); },
      submitT: function () {
        if (!(s.subj || '').trim()) { toast(self, 'Add a subject so the right team picks it up.', true); return; }
        var id = 'GC-T-' + (2292 + (s.added || []).length);
        var t = { id: id, s: s.subj, c: s.cat || CATS[0], st: 'open', u: 'just now', o: '29 Sep, now', agent: 'waiting for the next agent', m: [['me', s.body || s.subj, 'now']] };
        self.setState({ added: [t].concat(s.added || []), compose: false, subj: '', body: '', sel: id, f: 'active' }); toast(self, 'Ticket ' + id + ' sent. A reply usually comes within 2 hours.');
      },
      chips: [['active', 'Open'], ['solved', 'Solved'], ['all', 'All']].map(function (c) { var on = c[0] === f; return { label: c[1], n: cnt[c[0]], cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ f: c[0] }); } }; }),
      list: shown.map(function (t) { var on = t.id === cur.id, bb = STL[t.st]; return { id: t.id, s: t.s, c: t.c, u: t.u, st: bb[0], bb: bb[1], bf: bb[2], cls: on ? 'lrow on' : 'lrow', cur: on ? 'true' : 'false', open: function () { self.setState({ sel: t.id }); } }; }),
      cur: { id: cur.id, s: cur.s, c: cur.c, st: b[0], bb: b[1], bf: b[2], o: cur.o, agent: cur.agent },
      thread: cur.m.map(function (m) { var me = m[0] === 'me', ev = m[0] === 'event'; return { t: m[1], w: m[2], isEvent: ev, isMsg: !ev, al: me ? 'flex-end' : 'flex-start', bg: me ? '#003087' : '#f1f4f9', fg: me ? '#fff' : '#0f172a', who: me ? 'You' : 'GridCommerce support' }; }),
      reply: s.reply || '', onReply: function (e) { self.setState({ reply: val(e) }); },
      send: function () { var r = (s.reply || '').trim(); if (!r) return; var ex = assign({}, s.extra || {}); ex[cur.id] = (ex[cur.id] || []).concat([['me', r, 'now']]); var st = assign({}, s.st || {}); if (cur.st === 'solved') st[cur.id] = 'open'; self.setState({ extra: ex, reply: '', st: st }); toast(self, 'Reply sent.'); },
      closeLabel: cur.st === 'solved' ? 'Reopen' : 'Mark solved',
      closeT: function () { var st = assign({}, s.st || {}); st[cur.id] = cur.st === 'solved' ? 'open' : 'solved'; self.setState({ st: st }); toast(self, cur.st === 'solved' ? 'Ticket reopened.' : 'Marked solved. Thanks for letting us know.'); }
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
.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
`;

// ---- markup ----

export default class HelpSupportScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="HelpSupport">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="set-help" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Settings" page={"Help & support"} placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">{"Settings · Help & support"}</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>Tickets to the GridCommerce team, with every reply, call and email in one history. Support answers Saturday to Thursday, 9:00 AM to 9:00 PM.</p>
                  </div>
                  <button type="button" className="btn sm" onClick={v.newT} style={{ background: "#fff", color: "#0b1733", height: "36px", flexShrink: "0" }}>New ticket</button>
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
              {v.composing ? (<>
                <section className="tc sec">
                  <div>
                    <h2 className="h2">New ticket</h2>
                    <p className="sub">Replies arrive here and by SMS to the store phone.</p>
                  </div>
                  <div className="row2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label className="lbl" htmlFor="cat">Topic</label>
                      <select id="cat" className="sel" onChange={v.onCat}>
                        {__list(v.cats).map((ct, $index) => (<React.Fragment key={$index}>
                            <option value={ct}>{ct}</option>
                          </React.Fragment>))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label className="lbl" htmlFor="subj">Subject</label>
                      <input id="subj" className="inp" placeholder="What do you need help with?" value={v.subj} onChange={v.onSubj} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label className="lbl" htmlFor="body">Details</label>
                    <textarea id="body" className="inp" rows="3" style={{ height: "auto", padding: "10px 14px" }} placeholder="Order numbers, screenshots and steps help us answer faster." onChange={v.onBody} defaultValue={`${v.body ?? ""}`} />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="btn solid sm" onClick={v.submitT}>Send ticket</button>
                    <button type="button" className="btn line sm" onClick={v.cancelT}>Cancel</button>
                  </div>
                </section>
              </>) : null}
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "400px minmax(0, 1fr)", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: "8px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                    {__list(v.chips).map((ch, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={ch?.cls} onClick={ch?.pick}>{ch?.label}<span className="pcnt">{ch?.n}</span></button>
                      </React.Fragment>))}
                  </div>
                  {__list(v.list).map((t, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={t?.cls} onClick={t?.open} aria-current={t?.cur}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t?.id}</span>
                            <span className="badge" style={__sx(`background: ${t?.bb ?? ""}; color: ${t?.bf ?? ""}; height: 22px; font-size: var(--text-xs);`)}>{t?.st}</span>
                          </div>
                          <div style={{ marginTop: "4px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.s}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t?.c} · {t?.u}</div>
                        </div>
                      </button>
                    </React.Fragment>))}
                </section>
                <section className="tc" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "18px 20px", borderBottom: "1px solid #eef1f6" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.cur?.id}</span>
                        <span className="badge" style={__sx(`background: ${v.cur?.bb ?? ""}; color: ${v.cur?.bf ?? ""};`)}>{v.cur?.st}</span>
                        <span className="pill">{v.cur?.c}</span>
                      </div>
                      <h2 className="h2" style={{ marginTop: "6px" }}>{v.cur?.s}</h2>
                      <p className="sub">Opened {v.cur?.o} · handled by {v.cur?.agent}</p>
                    </div>
                    <button type="button" className="abtn" onClick={v.closeT}>{v.closeLabel}</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", minHeight: "380px" }}>
                    {__list(v.thread).map((m, $index) => (<React.Fragment key={$index}>
                        <div style={__sx(`display: flex; flex-direction: column; align-items: ${m?.al ?? ""}; gap: 4px;`)}>
                          {m?.isEvent ? (<>
                            <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "var(--radius-full)", background: "#f1f4f9", fontSize: "var(--text-xs)", color: "#475569" }}>{m?.t} · {m?.w}</div>
                          </>) : null}
                          {m?.isMsg ? (<>
                            <div className="msgb" style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.t}</div>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{m?.who} · {m?.w}</span>
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ display: "flex", gap: "10px", padding: "14px 20px", borderTop: "1px solid #eef1f6", background: "#fbfcfe" }}>
                    <input className="inp" aria-label="Reply" placeholder="Write a reply" value={v.reply} onChange={v.onReply} />
                    <button type="button" className="btn solid sm" style={{ height: "44px" }} onClick={v.send}>Send</button>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
