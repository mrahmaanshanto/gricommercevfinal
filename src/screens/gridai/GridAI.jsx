'use client';
// Generated from design/templates/gridai/GridAI.dc.html by scripts/convert-design.mjs.
// GridAI — GridAI — chat and voice assistant over orders, dispatch, stock and sales, with confirm-first actions.
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

var QA = {
  confirm: { q: 'Which orders still need confirming?', bn: 'কোন অর্ডারগুলো এখনো কনফার্ম হয়নি?', kind: 'table', title: '3 orders still need confirming · ৳4,880',
    rows: [['#ORD-0929-014', 'Nusrat Jahan · online · needs a person', '৳2,450'], ['#ORD-0929-010', 'Tanvir Ahmed · Mirpur · no answer after 3 tries', '৳890'], ['#ORD-0929-008', 'Sumaiya Islam · Dhanmondi · call back at 5:00 PM', '৳1,540']],
    foot: 'AI calls confirmed 3 today and stopped 2 (a cancellation and a wrong number). Nusrat wants a different colour, so a staff call is needed.', footBn: 'আজ এআই কলে ৩টি কনফার্ম হয়েছে, ২টি বাদ পড়েছে। নুসরাত অন্য রঙ চান, তাই স্টাফের কল লাগবে।' },
  dispatch: { q: 'Dispatch today by courier', bn: 'আজকে কোন কুরিয়ারে কত পার্সেল?', kind: 'table', title: 'Dispatch today · 23 parcels',
    rows: [['Pathao', '12 booked · 9 picked up', '৳31,200 COD'], ['Steadfast', '8 booked · pickup at 5:00 PM', '৳15,600 COD'], ['RedX', '3 booked · 3 picked up', '৳7,800 COD'], ['Ready to ship', '6 confirmed, not booked yet', 'Central Warehouse']],
    foot: 'Steadfast pickup is late by 40 minutes. The 6 ready orders can be booked now.', footBn: 'স্টেডফাস্টের পিকআপ ৪০ মিনিট দেরি। ৬টি প্রস্তুত অর্ডার এখনই বুক করা যায়।', then: 'book' },
  stock: { q: 'Stock of 20W USB-C charger everywhere', bn: '২০ ওয়াট চার্জারের স্টক কোথায় কত?', kind: 'table', title: '20W USB-C Fast Charger · 20 in stock',
    rows: [['Central Warehouse', 'Tejgaon · ships online orders', '11'], ['Chattogram hub', 'Agrabad', '4'], ['Dhanmondi branch', 'shop', '5'], ['Mirpur branch', 'shop · alert level 12', '0']],
    foot: 'Mirpur is out and sold 2 today. Moving 4 from Central Warehouse covers about 3 days.', footBn: 'মিরপুরে স্টক শেষ। সেন্ট্রাল ওয়্যারহাউস থেকে ৪টি পাঠালে ৩ দিন চলবে।', then: 'transfer' },
  sales: { q: 'আজকের বিক্রি কত?', bn: 'আজকের বিক্রি কত?', kind: 'text',
    en: 'Sales today: ৳1,42,330 from 77 orders across all branches. That is 11% more than yesterday. Online leads with ৳62,480.',
    bnA: 'আজ সব ব্রাঞ্চ মিলিয়ে বিক্রি ৳১,৪২,৩৩০, মোট ৭৭টি অর্ডার। গতকালের চেয়ে ১১% বেশি। অনলাইন সবার আগে, ৳৬২,৪৮০।' }
};
var ACT = {
  book: { title: 'Book 6 ready orders with Pathao', t: 'Pickup from Central Warehouse today at 5:00 PM. Courier cost ৳420, charged at remittance.', tBn: 'আজ বিকাল ৫টায় সেন্ট্রাল ওয়্যারহাউস থেকে পিকআপ। কুরিয়ার খরচ ৳৪২০।', ok: 'Book 6 parcels', done: '6 parcels booked with Pathao. Tracking codes are on each order.' },
  transfer: { title: 'Transfer 4 chargers to Mirpur', t: 'From Central Warehouse to Mirpur branch. A transfer is created and the branch confirms on arrival.', tBn: 'সেন্ট্রাল ওয়্যারহাউস থেকে মিরপুরে ৪টি চার্জার পাঠানো হবে।', ok: 'Create transfer', done: 'Transfer TR-0929-03 created: 4 × 20W USB-C Fast Charger to Mirpur.' }
};
var ORDER = ['confirm', 'dispatch', 'stock', 'sales'];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var lang = s.lang || 'en', bn = lang === 'bn';
    var log = s.log || [{ r: 'me', k: 'q', id: 'confirm' }, { r: 'ai', k: 'a', id: 'confirm' }];
    var acts = s.acts || {};
    function ask(id) { var add = [{ r: 'me', k: 'q', id: id }, { r: 'ai', k: 'a', id: id }]; if (QA[id].then) add.push({ r: 'ai', k: 'act', id: QA[id].then }); self.setState({ log: log.concat(add), q: '', listening: false }); }
    var v = {
      langs: lseg(self, [['en', 'English'], ['bn', 'বাংলা']], lang, 'lang'),
      thread: log.map(function (m) {
        var o = { al: m.r === 'me' ? 'flex-end' : 'flex-start', who: m.r === 'me' ? 'You' : 'GridAI', isText: false, isTable: false, isAction: false, bn: '' };
        if (m.k === 'q') { var qq = QA[m.id]; return assign(o, { isText: true, t: m.free || (bn ? qq.bn : qq.q), bg: '#003087', fg: '#fff', bn: bn || m.id === 'sales' ? 'bn' : '' }); }
        if (m.k === 'free') return assign(o, { isText: true, t: bn ? 'এই প্রশ্নের উত্তর দিতে অর্ডার, স্টক ও বিক্রির তথ্য দেখছি। নিচের যেকোনো প্রশ্ন দিয়ে শুরু করতে পারেন।' : 'That question needs a report this trial does not cover yet. Try one of the suggestions below.', bg: '#f1f4f9', fg: '#0f172a', bn: bn ? 'bn' : '' });
        if (m.k === 'a') { var a = QA[m.id];
          if (a.kind === 'text') return assign(o, { isText: true, t: bn ? a.bnA : a.en, bg: '#f1f4f9', fg: '#0f172a', bn: bn ? 'bn' : '' });
          return assign(o, { isTable: true, title: a.title, foot: bn ? a.footBn : a.foot, rows: a.rows.map(function (r) { return { a: r[0], b: r[1], c: r[2], cc: r[2] === '0' ? '#b83210' : '#0f172a' }; }) }); }
        var c = ACT[m.id], st = acts[m.id] || 'wait';
        return assign(o, { isAction: true, title: c.title, t: bn ? c.tBn : c.t, pending: st === 'wait', okLabel: c.ok,
          status: st === 'wait' ? 'Needs your OK' : st === 'done' ? 'Done' : 'Skipped', sb: st === 'wait' ? '#fff4e0' : st === 'done' ? '#e7f8f1' : '#f1f5f9', sf: st === 'wait' ? '#a14f06' : st === 'done' ? '#047857' : '#475569', bd: st === 'wait' ? '#f5c77e' : '#e7ebf2',
          ok: function () { var n = assign({}, acts); n[m.id] = 'done'; self.setState({ acts: n }); toast(self, c.done); },
          no: function () { var n = assign({}, acts); n[m.id] = 'skip'; self.setState({ acts: n }); } });
      }),
      sugg: ORDER.map(function (id) { return { l: bn ? QA[id].bn : QA[id].q, bn: bn || id === 'sales' ? 'bn' : '', ask: function () { ask(id); } }; }),
      q: s.q || '', onQ: function (e) { self.setState({ q: val(e) }); },
      send: function () { var t = (s.q || '').trim(); if (!t) return; var low = t.toLowerCase(); var id = /confirm|কনফার্ম/.test(low) ? 'confirm' : /courier|dispatch|কুরিয়ার|পার্সেল/.test(low) ? 'dispatch' : /stock|স্টক|charger/.test(low) ? 'stock' : /sale|বিক্রি/.test(low) ? 'sales' : null;
        if (id) { var add = [{ r: 'me', k: 'q', id: id, free: t }, { r: 'ai', k: 'a', id: id }]; if (QA[id].then) add.push({ r: 'ai', k: 'act', id: QA[id].then }); self.setState({ log: log.concat(add), q: '' }); }
        else self.setState({ log: log.concat([{ r: 'me', k: 'q', id: 'sales', free: t }, { r: 'ai', k: 'free' }]), q: '' }); },
      listening: !!s.listening, langName: bn ? 'Bangla' : 'English', micAria: s.listening ? 'Stop listening' : 'Speak', micBg: s.listening ? '#003087' : 'rgba(0,48,135,.08)', micFg: s.listening ? '#fff' : '#003087',
      mic: function () { if (!s.listening) { self.setState({ listening: true }); return; } var add = [{ r: 'me', k: 'q', id: 'sales' }, { r: 'ai', k: 'a', id: 'sales' }]; self.setState({ listening: false, log: log.concat(add), lang: 'bn' }); toast(self, 'Voice question heard in Bangla · 6 seconds · ৳0.20 from the wallet.'); },
      sOrders: mkSw(self, 'sOrders', true), sDispatch: mkSw(self, 'sDispatch', true), sStock: mkSw(self, 'sStock', true), sMoney: mkSw(self, 'sMoney', true),
      voice: [{ l: 'Languages', v: 'Bangla, English' }, { l: 'Voice price', v: '৳2 per minute' }, { l: 'Used this month', v: '38 min · ৳76' }],
      fab: function () { toast(self, 'This button sits on every page and opens GridAI over the current screen.'); }
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
.wave{display:flex;align-items:center;gap:3px;height:28px}.wave span{width:4px;border-radius:2px;background:#003087;animation:gw 900ms ease-in-out infinite alternate}
.wave span:nth-child(2){animation-delay:120ms}.wave span:nth-child(3){animation-delay:240ms}.wave span:nth-child(4){animation-delay:360ms}.wave span:nth-child(5){animation-delay:480ms}
@keyframes gw{from{height:6px}to{height:26px}}
@media (prefers-reduced-motion:reduce){.wave span{animation:none;height:14px}}
.sugg{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #d6dff0;background:#fff;font:inherit;font-size:var(--text-xs-plus);color:#003087;cursor:pointer;white-space:nowrap}
.sugg:hover{background:rgba(0,48,135,.05)}.sugg:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.fab{position:absolute;right:28px;bottom:28px;width:60px;height:60px;border-radius:var(--radius-full);border:0;background:#003087;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 28px -8px rgba(0,48,135,.55);cursor:pointer}
.fab:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:3px}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
`;

// ---- markup ----

export default class GridAIScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="GridAI">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="gridai" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="General" page="GridAI" placeholder="Search orders, products or customers" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div className="fill" style={{ display: "flex", flexDirection: "column", gap: "16px", flexGrow: "1", minHeight: "0" }}>
                {v.hasMsg ? (<>
                  <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.msg}</span>
                  </div>
                </>) : null}
                <div className="gc-split" style={{ position: "relative", flexGrow: "1", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "16px", minHeight: "0" }}>
                  <section className="tc" style={{ display: "flex", flexDirection: "column", minHeight: "0", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #eef1f6" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <h1 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>GridAI</h1>
                        <p className="sub" style={{ margin: "0" }}>Ask about orders, dispatch, stock and sales. Actions run only after you confirm.</p>
                      </div>
                      <div className="lseg" role="radiogroup" aria-label="Reply language">
                        {__list(v.langs).map((m, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                          </React.Fragment>))}
                      </div>
                      <span className="badge" style={{ background: "#e0f2fe", color: "#075985" }}>Trial · 14 days left</span>
                    </div>
                    <div style={{ flexGrow: "1", overflow: "auto", display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
                      {__list(v.thread).map((m, $index) => (<React.Fragment key={$index}>
                          <div style={__sx(`display: flex; flex-direction: column; align-items: ${m?.al ?? ""}; gap: 6px;`)}>
                            {m?.isText ? (<>
                              <div className={`msgb ${m?.bn ?? ""}`} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; white-space: pre-line;`)}>{m?.t}</div>
                            </>) : null}
                            {m?.isTable ? (<>
                              <div style={{ width: "min(640px, 92%)", border: "1px solid #e7ebf2", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#fff" }}>
                                <div style={{ padding: "12px 14px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", borderBottom: "1px solid #eef1f6" }}>{m?.title}</div>
                                <div className="gc-table-wrap">
                                  <table className="tb">
                                    <tbody>
                                      {__list(m?.rows).map((r, $index) => (<React.Fragment key={$index}>
                                          <tr>
                                            <td style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.a}</td>
                                            <td style={{ color: "#475569" }}>{r?.b}</td>
                                            <td className="r tn" style={__sx(`font-weight: var(--weight-medium); color: ${r?.cc ?? ""};`)}>{r?.c}</td>
                                          </tr>
                                        </React.Fragment>))}
                                    </tbody>
                                  </table>
                                </div>
                                <div style={{ padding: "10px 14px", fontSize: "var(--text-xs-plus)", color: "#475569", background: "#fbfcfe" }}>{m?.foot}</div>
                              </div>
                            </>) : null}
                            {m?.isAction ? (<>
                              <div style={__sx(`width: min(560px, 92%); display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border-radius: var(--radius-xl); border: 1.5px solid ${m?.bd ?? ""}; background: #fff;`)}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className="badge" style={__sx(`background: ${m?.sb ?? ""}; color: ${m?.sf ?? ""};`)}>{m?.status}</span>
                                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{m?.title}</span>
                                </div>
                                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>{m?.t}</div>
                                {m?.pending ? (<>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button type="button" className="btn solid sm" onClick={m?.ok}>{m?.okLabel}</button>
                                    <button type="button" className="btn line sm" onClick={m?.no}>Not now</button>
                                  </div>
                                </>) : null}
                              </div>
                            </>) : null}
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{m?.who}</span>
                          </div>
                        </React.Fragment>))}
                      {v.listening ? (<>
                        <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "var(--radius-xl)", background: "rgba(0,48,135,.06)" }}>
                          <div className="wave" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#003087" }}>Listening in {v.langName} · tap the mic to stop</span>
                        </div>
                      </>) : null}
                    </div>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "0 20px 12px" }}>
                      {__list(v.sugg).map((g, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={`sugg ${g?.bn ?? ""}`} onClick={g?.ask}>{g?.l}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", gap: "10px", padding: "14px 20px", borderTop: "1px solid #eef1f6", background: "#fbfcfe" }}>
                      <button type="button" className="ib" onClick={v.mic} aria-label={v.micAria} aria-pressed={v.listening} style={__sx(`width: 44px; height: 44px; background: ${v.micBg ?? ""}; color: ${v.micFg ?? ""};`)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="9" y="2" width="6" height="12" rx="3" />
                          <path d="M5 10a7 7 0 0 0 14 0" />
                          <path d="M12 17v4" />
                        </svg>
                      </button>
                      <input className="inp" aria-label="Ask GridAI" placeholder="Ask anything, in Bangla or English" value={v.q} onChange={v.onQ} />
                      <button type="button" className="btn solid sm" style={{ height: "44px" }} onClick={v.send}>Ask</button>
                    </div>
                  </section>
                  <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0", overflow: "auto" }}>
                    <section className="tc sec">
                      <div>
                        <h2 className="h2">What GridAI can see</h2>
                        <p className="sub">Follows each staff member’s role. Staff see only their branch.</p>
                      </div>
                      <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)" }}>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Orders and customers</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Phone numbers are masked for staff.</div>
                          </div>
                          <button type="button" className={v.sOrders?.cls} role="switch" aria-checked={v.sOrders?.on} aria-label="Orders and customers" onClick={v.sOrders?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Dispatch and couriers</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Pickups, parcels, COD due.</div>
                          </div>
                          <button type="button" className={v.sDispatch?.cls} role="switch" aria-checked={v.sDispatch?.on} aria-label="Dispatch and couriers" onClick={v.sDispatch?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Warehouses and stock</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Central Warehouse, hub and branches.</div>
                          </div>
                          <button type="button" className={v.sStock?.cls} role="switch" aria-checked={v.sStock?.on} aria-label="Warehouses and stock" onClick={v.sStock?.toggle} />
                        </div>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Sales and profit</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Owner and managers only.</div>
                          </div>
                          <button type="button" className={v.sMoney?.cls} role="switch" aria-checked={v.sMoney?.on} aria-label="Sales and profit" onClick={v.sMoney?.toggle} />
                        </div>
                      </div>
                    </section>
                    <section className="tc sec">
                      <div>
                        <h2 className="h2">Voice</h2>
                        <p className="sub">Speak Bangla or English. Charged from the wallet.</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                        {__list(v.voice).map((k, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f4f8", fontSize: "var(--text-xs-plus)" }}>
                              <span style={{ color: "var(--text-muted)" }}>{k?.l}</span>
                              <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{k?.v}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                    <section className="tc sec">
                      <div>
                        <h2 className="h2">Where GridAI lives</h2>
                        <p className="sub">A round button at the bottom-right of every page opens this panel over the page you are on.</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>
                        <span>Questions answer from live data, with the numbers shown in a card.</span>
                        <span>Actions like booking a courier or moving stock show a card first. Nothing runs until Confirm is pressed.</span>
                        <span>Every action is saved in the order or stock history with who confirmed it.</span>
                      </div>
                    </section>
                  </aside>
                  <button type="button" className="fab" aria-label="GridAI" onClick={v.fab}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
