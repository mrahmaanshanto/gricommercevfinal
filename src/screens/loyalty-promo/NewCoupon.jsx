'use client';
// Generated from design/templates/loyalty-promo/NewCoupon.dc.html by scripts/convert-design.mjs.
// NewCoupon — Loyalty, rewards & promo — New coupon.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';

// ---- form helpers: required marker, field error text, invalid attributes, focus the first error ----
function __Req() { return <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}> *</span>; }
function __Err({ id, msg }) { return msg ? <span id={id} style={{ display: 'block', fontSize: 'var(--text-xs)', lineHeight: '16px', color: 'var(--text-danger)' }}>{msg}</span> : null; }
function __inv(err, id) { return err ? { 'aria-invalid': 'true', 'aria-describedby': id } : {}; }
function __focusSoon(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
function __without(o, k) { var r = {}; for (var x in (o || {})) if (x !== k) r[x] = o[x]; return r; }

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var IDEAS = [
  { k: 'first', code: 'FIRST20', title: 'Welcome new buyers', sub: '20% off the first order, up to ৳400', kind: 'pct', amt: 20, cap: 400, who: 'first', minb: 0 },
  { k: 'ship', code: 'FREESHIP', title: 'Free delivery', sub: 'On bills of ৳1,500 or more', kind: 'ship', amt: 0, cap: 0, who: 'all', minb: 1500 },
  { k: 'eid', code: 'EID300', title: 'Festival offer', sub: '৳300 off on ৳2,000+', kind: 'tk', amt: 300, cap: 0, who: 'all', minb: 2000 },
  { k: 'vip', code: 'GOLD500', title: 'Thank loyal members', sub: '৳500 off for Gold and Platinum', kind: 'tk', amt: 500, cap: 0, who: 'gold', minb: 5000 },
  { k: 'bkash', code: 'BKASH10', title: 'Pay by bKash offer', sub: '10% off when paid by bKash, up to ৳150', kind: 'pct', amt: 10, cap: 150, who: 'all', minb: 500, pmode: 'online', methods: { bkash: true } },
  { k: 'split', code: 'PAYSAVE', title: 'More off for paying first', sub: 'Card 12%, bKash / Nagad 8%, cash 3%', kind: 'pct', amt: 8, cap: 500, who: 'all', minb: 1000, pmode: 'split', split: { card: 12, bkash: 8, nagad: 8, rocket: 0, wallet: 10, cod: 3 } }
];
var PM = [
  { k: 'bkash', label: 'bKash', bg: '#fde7f1', fg: '#b0145a' }, { k: 'nagad', label: 'Nagad', bg: '#fff1e6', fg: '#b4410c' }, { k: 'rocket', label: 'Rocket', bg: '#f3e8ff', fg: '#6b21a8' },
  { k: 'card', label: 'Card', bg: '#e0f2fe', fg: '#075985' }, { k: 'wallet', label: 'Shop wallet', bg: 'rgba(0,48,135,.08)', fg: '#003087' }, { k: 'cod', label: 'Cash on delivery', bg: '#eef2f6', fg: '#475569' }
];
var ONLINE = PM.filter(function (m) { return m.k !== 'cod'; });
var BANKS = ['City Bank (Amex)', 'EBL', 'BRAC Bank', 'Dutch-Bangla', 'Standard Chartered', 'Prime Bank'];
var PMODES = [
  { k: 'any', label: 'Any payment', sub: 'Cash on delivery and online both get it' },
  { k: 'online', label: 'Only online payment', sub: 'bKash, Nagad, card… pick which ones' },
  { k: 'split', label: 'Different discount by payment', sub: 'e.g. card 12%, bKash 8%, cash 3%' },
  { k: 'cod', label: 'Only cash on delivery', sub: 'Online payments don’t get it' }
];
var DEFSPLIT = { card: 12, bkash: 8, nagad: 8, rocket: 5, wallet: 10, cod: 0 };
var KINDS = [{ k: 'tk', label: 'Taka off' }, { k: 'pct', label: '% off' }, { k: 'ship', label: 'Free delivery' }];
var WHOS = [{ k: 'all', label: 'Everyone' }, { k: 'first', label: 'First order only' }, { k: 'gold', label: 'Gold and Platinum members' }, { k: 'one', label: 'One customer (by phone)' }];
var PRODS = [{ k: 'all', label: 'All products' }, { k: 'cat', label: 'One category' }, { k: 'some', label: 'Some products' }];
var WHERES = [{ k: 'both', label: 'Website and POS counter' }, { k: 'web', label: 'Website only' }, { k: 'pos', label: 'POS counter only' }];
var WORDS = ['HAPPY', 'SAVE', 'DEAL', 'SHUBHO', 'BONUS'];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var idea = s.idea || 'eid', I = IDEAS.filter(function (x) { return x.k === idea; })[0] || IDEAS[2];
    var kind = s.kind || I.kind;
    var errs = s.errs || {};
    var amtStep = kind === 'pct' ? 5 : 50, amtMax = kind === 'pct' ? 90 : 10000;
    var amtV = s.amt == null ? (I.amt || (kind === 'pct' ? 10 : 100)) : s.amt;
    // The amount can be typed (and so can be empty); the steppers keep their old step and limits.
    var amt = { v: amtV,
      dec: function () { self.setState({ amt: Math.max(amtStep, (+amtV || 0) - amtStep), errs: __without(errs, 'amt') }); },
      inc: function () { self.setState({ amt: Math.min(amtMax, (+amtV || 0) + amtStep), errs: __without(errs, 'amt') }); } };
    var dStart = s.dStart != null ? s.dStart : '2026-09-18', dEnd = s.dEnd != null ? s.dEnd : '2026-09-30';
    var endTxt = (function () { var p = dEnd.split('-'); return p.length === 3 ? 'Valid till ' + (+p[2]) + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0] : 'No end date'; })();
    var cap = stepN(this, 'cap', I.cap || 300, 50, 50, 5000), minb = stepN(this, 'minb', I.minb, 500, 0, 50000), lim = stepN(this, 'lim', 500, 50, 50, 10000);
    var code = (s.code != null ? s.code : I.code).toUpperCase();
    var bill = Math.max(2500, minb.v), off, big, rule;
    if (kind === 'tk') { off = amt.v; big = '৳' + amt.v.toLocaleString('en-IN') + ' OFF'; }
    else if (kind === 'pct') { off = Math.min(cap.v, Math.round(bill * amt.v / 100)); big = amt.v + '% OFF'; }
    else { off = 80; big = 'FREE DELIVERY'; }
    rule = (minb.v ? 'On bills of ' + bdt(minb.v) + ' or more' : 'On any bill') + (kind === 'pct' ? ' · up to ' + bdt(cap.v) : '');
    var pickIdea = function (x) { return function () { self.setState({ errs: {}, idea: x.k, kind: null, amt: null, cap: null, minb: null, code: null, who: x.who, pmode: x.pmode || 'any', pm: x.methods || null, split: x.split || null, splitOn: null, exPm: x.k === 'split' ? 'card' : 'bkash' }); }; };
    var pmode = s.pmode || I.pmode || 'any';
    var pm = s.pm || I.methods || { bkash: true, nagad: true, card: true };
    var split = s.split || I.split || DEFSPLIT;
    var splitOn = s.splitOn || {}; PM.forEach(function (m) { if (splitOn[m.k] == null) splitOn[m.k] = split[m.k] > 0; });
    var cardMode = s.cardMode || 'any', banks = s.banks || { 'EBL': true };
    var toggleIn = function (key, obj, k) { var o = {}; for (var x in obj) o[x] = obj[x]; o[k] = !o[k]; var p = {}; p[key] = o; self.setState(p); };
    var unitOf = kind === 'pct' ? '% off' : kind === 'tk' ? 'taka off' : '';
    var offFor = function (mk) {
      var base = kind === 'ship' ? 80 : kind === 'tk' ? amt.v : Math.min(cap.v, Math.round(bill * amt.v / 100));
      if (bill < minb.v) return { ok: false, why: 'Bill is below ' + bdt(minb.v) };
      if (pmode === 'online') return pm[mk] && mk !== 'cod' ? { ok: true, v: base } : { ok: false, why: mk === 'cod' ? 'This code needs online payment' : 'Not for ' + PM.filter(function (m) { return m.k === mk; })[0].label };
      if (pmode === 'cod') return mk === 'cod' ? { ok: true, v: base } : { ok: false, why: 'Only for cash on delivery' };
      if (pmode === 'split') { if (!splitOn[mk]) return { ok: false, why: 'No discount for this payment' }; var a = split[mk]; return { ok: true, v: kind === 'ship' ? 80 : kind === 'tk' ? a : Math.min(cap.v, Math.round(bill * a / 100)), a: a }; }
      return { ok: true, v: base };
    };
    var exPm = s.exPm || (pmode === 'cod' ? 'cod' : 'bkash');
    var EX = offFor(exPm);
    var badgeFor = function (m) {
      var r = offFor(m.k); if (!r.ok) return { badge: 'No offer', bBg: '#eef2f6', bFg: '#64748b', op: 0.6 };
      if (kind === 'ship') return { badge: 'Free delivery', bBg: '#e7f8f1', bFg: '#047857', op: 1 };
      return { badge: pmode === 'split' && kind === 'pct' ? r.a + '% off' : '−' + bdt(r.v), bBg: '#e7f8f1', bFg: '#047857', op: 1 };
    };
    var payRule = pmode === 'online' ? ' · pay by ' + ONLINE.filter(function (m) { return pm[m.k]; }).map(function (m) { return m.label; }).join(', ') : pmode === 'cod' ? ' · cash on delivery only' : pmode === 'split' ? ' · discount depends on payment' : '';
    return {
      ideas: IDEAS.map(function (x) { var on = x.k === idea; return { code: x.code, title: x.title, sub: x.sub, on: on, border: on ? '#003087' : '#e2e8f0', bg: on ? '#f2f6fc' : '#ffffff', pick: pickIdea(x) }; }),
      kinds: KINDS.map(function (x) { var on = x.k === kind; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ kind: x.k, amt: x.k === 'pct' ? 10 : 200, errs: __without(errs, 'amt') }); } }; }), hasAmt: kind !== 'ship', isPct: kind === 'pct', unit: kind === 'pct' ? '% off' : 'taka off',
      amt: amt, cap: cap, minb: minb, lim: lim, code: code,
      errs: errs,
      typeAmt: function (e) { var d = e.target.value.replace(/[^0-9]/g, ''); self.setState({ amt: d === '' ? '' : Math.min(amtMax, +d), errs: __without(errs, 'amt') }); },
      dStart: dStart, dEnd: dEnd, endTxt: endTxt,
      typeStart: function (e) { self.setState({ dStart: e.target.value, errs: __without(__without(errs, 'start'), 'end') }); },
      typeEnd: function (e) { self.setState({ dEnd: e.target.value, errs: __without(errs, 'end') }); },
      typeCode: function (e) { self.setState({ code: e.target.value.replace(/\s/g, ''), errs: __without(errs, 'code') }); },
      autoCode: function () { var n = (s.n || 0) + 1; self.setState({ n: n, errs: __without(errs, 'code'), code: WORDS[n % WORDS.length] + (kind === 'pct' ? amt.v : kind === 'tk' ? amt.v : '') }); },
      whos: mkChips(this, WHOS, s.who || I.who, 'who'), prods: mkChips(this, PRODS, s.prod || 'all', 'prod'), wheres: mkChips(this, WHERES, s.where || 'both', 'where'),
      once: mkSw(this, 'once', true), stack: mkSw(this, 'stack', false),
      bigGets: pmode === 'split' && kind !== 'ship' ? 'UP TO ' + (kind === 'pct' ? Math.max.apply(null, PM.map(function (m) { return splitOn[m.k] ? split[m.k] : 0; })) + '%' : '৳' + Math.max.apply(null, PM.map(function (m) { return splitOn[m.k] ? split[m.k] : 0; }))) + ' OFF' : big, smallRule: rule + payRule,
      pmodes: PMODES.map(function (o) { var on = o.k === pmode; return { label: o.label, sub: o.sub, on: on, border: on ? '#003087' : '#e2e8f0', bg: on ? '#f2f6fc' : '#ffffff', ring: on ? '#003087' : '#94a3b8', dot: on ? '#003087' : 'transparent', pick: function () { self.setState({ pmode: o.k, exPm: o.k === 'cod' ? 'cod' : (o.k === 'online' ? 'bkash' : exPm) }); } }; }),
      isOnline: pmode === 'online', isSplit: pmode === 'split', isCod: pmode === 'cod',
      methods: ONLINE.map(function (m) { var on = !!pm[m.k]; return { label: m.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { toggleIn('pm', pm, m.k); } }; }),
      showBanks: pmode === 'online' && !!pm.card, someBanks: cardMode === 'some',
      cardModes: mkChips(this, [{ k: 'any', label: 'Any card (Visa, Mastercard, Amex)' }, { k: 'some', label: 'Only some banks’ cards' }], cardMode, 'cardMode'),
      banks: BANKS.map(function (b) { var on = !!banks[b]; return { label: b, on: on, cls: on ? 'chip on' : 'chip', pick: function () { toggleIn('banks', banks, b); } }; }),
      split: PM.map(function (m) {
        var on = !!splitOn[m.k], v = split[m.k] || 0, step = kind === 'pct' ? 1 : 50, mx = kind === 'pct' ? 90 : 10000;
        var setV = function (nv) { var o = {}; for (var x in split) o[x] = split[x]; o[m.k] = Math.max(0, Math.min(mx, nv)); self.setState({ split: o }); };
        var r = offFor(m.k);
        return { label: m.label, mBg: m.bg, mFg: m.fg, on: on, swCls: on ? 'sw on' : 'sw', bg: on ? '#ffffff' : '#f8fafc',
          v: kind === 'pct' ? v + '%' : bdt(v), unit: unitOf, showAmt: on && kind !== 'ship',
          note: on ? (kind === 'ship' ? 'Free delivery' : 'On a ' + bdt(bill) + ' bill: −' + bdt(r.ok ? r.v : 0)) : 'No discount', noteColor: on ? '#047857' : '#94a3b8',
          dn: function () { setV(v - step); }, up: function () { setV(v + step); },
          toggle: function () { var o = {}; for (var x in splitOn) o[x] = splitOn[x]; o[m.k] = !on; if (!on && !split[m.k]) setV(kind === 'pct' ? 5 : 100); self.setState({ splitOn: o }); } };
      }),
      exNote: !EX.ok || (kind === 'pct' && pmode !== 'split' && Math.round(bill * amt.v / 100) > cap.v), exNoteText: !EX.ok ? EX.why + ' — the customer pays full price.' : 'Limited to ' + bdt(cap.v) + ' because of the maximum.',
      onPage: mkSw(this, 'onPage', true), atCheckout: mkSw(this, 'atCheckout', true),
      postTitle: s.postTitle != null ? s.postTitle : (kind === 'ship' ? 'Free delivery' : big.charAt(0) + big.slice(1).toLowerCase()) + ' — ' + rule.charAt(0).toLowerCase() + rule.slice(1),
      typeTitle: function (e) { self.setState({ postTitle: e.target.value, errs: __without(errs, 'title') }); },
      slug: code.toLowerCase(),
      noImg: !s.img, hasImg: !!s.img,
      imgBg: s.img === 'auto' ? 'linear-gradient(135deg, #012169, #0a5bd0)' : 'linear-gradient(160deg, rgba(15,23,42,.1), rgba(15,23,42,.55)), linear-gradient(135deg, #b83210, #f59e0b)',
      imgTag: s.img === 'auto' ? 'READY COVER' : 'YOUR PICTURE', imgText: s.img === 'auto' ? big : 'Festival sale',
      imgName: s.img === 'auto' ? 'Ready cover' : 'eid-offer-banner.jpg', imgNote: s.img === 'auto' ? 'Made from your offer. Changes by itself if you change the discount.' : '1200 × 630 · 184 KB',
      upload: function () { self.setState({ img: 'file' }); }, useAuto: function () { self.setState({ img: 'auto' }); }, removeImg: function () { self.setState({ img: null }); },
      sd: s.sd != null ? s.sd : 'Festival offer on everything in the shop — website and shop counter.',
      typeSd: function (e) { self.setState({ sd: e.target.value.slice(0, 140) }); },
      sdCount: ((s.sd != null ? s.sd : 'Festival offer on everything in the shop — website and shop counter.').length) + ' / 140', sdColor: '#64748b',
      fullDesc: 'This festival, shop more and save more. Get ' + (kind === 'ship' ? 'free delivery' : big.toLowerCase()) + ' on your bill with code ' + code + '. Works on our website and at our shop counter.\n\nএই উৎসবে বেশি কিনুন, বেশি সাশ্রয় করুন। কোড ' + code + ' ব্যবহার করুন।',
      // Validate, show each problem under its field, focus the first one; only a valid form saves.
      submit: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var er = {}, first = null, add = function (k, id, m) { er[k] = m; if (!first) first = id; };
        var onPageOn = s.onPage == null ? true : s.onPage;
        var title = s.postTitle != null ? s.postTitle : 'x';
        if (kind !== 'ship' && !(+amtV > 0)) add('amt', 'cp-amt', 'Enter how much the customer gets off.');
        if (!code) add('code', 'cp-code', 'Enter the code customers will type.');
        else if (!/^[A-Z0-9]{3,20}$/.test(code)) add('code', 'cp-code', 'Use 3 to 20 letters or numbers, with no spaces or symbols.');
        if (!dStart) add('start', 'cp-start', 'Choose the day the code starts.');
        if (dStart && dEnd && dEnd < dStart) add('end', 'cp-end', 'The end date must be on or after the start date.');
        if (onPageOn && !title.trim()) add('title', 'cp-title', 'Enter a title for the offer post.');
        if (first) { self.setState({ errs: er }); __focusSoon(first); return; }
        self.setState({ errs: {} });
        __toast(code + ' is on. Customers can use it from today.');
      }
    };
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

.inp[aria-invalid="true"],.stepbox[aria-invalid="true"]{border-color:var(--text-danger)!important}
.inp[aria-invalid="true"]:focus{border-color:var(--text-danger)}
@media (max-width:1023px){.gc-shell__content :has(> .gc-side){align-items:stretch!important}}
.stepinp{width:64px;height:36px;padding:0;border:0;background:transparent;text-align:center;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:inherit}
.stepinp:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
@media (max-width:767px){.cp-coderow{flex-direction:column}.cp-coderow .inp{max-width:none!important}.cp-img{flex-direction:column}.cp-img>div:first-child{width:100%!important}}
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
`;

// ---- markup ----

export default class NewCouponScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewCoupon">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="promo-coupons" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Promo / Discount codes" page="Make a new code" placeholder="Search a code" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Make a new code" />
              <form noValidate onSubmit={v.submit} aria-label="New discount code" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>What does the customer get?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.kinds).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    {v.hasAmt ? (<>
                      <label className="lbl" htmlFor="cp-amt" style={{ marginBottom: "-8px" }}>Discount<__Req /></label>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                        <div className="stepbox" {...(v.errs?.amt ? { "aria-invalid": "true" } : {})} style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                          <button type="button" className="ib" aria-label="Less discount" onClick={v.amt?.dec} style={{ borderRadius: "0" }}>
                            <__Icon name="minus" width="18" height="18" aria-hidden="true" />
                          </button>
                          <input id="cp-amt" className="stepinp" type="text" inputMode="numeric" autoComplete="off" value={v.amt?.v} onChange={v.typeAmt} aria-required="true" {...__inv(v.errs?.amt, "cp-amt-err")} />
                          <button type="button" className="ib" aria-label="More discount" onClick={v.amt?.inc} style={{ borderRadius: "0" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </button>
                        </div>
                        <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>{v.unit}</span>
                        {v.isPct ? (<>
                          <span style={{ marginLeft: "16px", fontSize: "var(--text-sm)", color: "#334155" }}>but not more than</span>
                          <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                            <button type="button" className="ib" aria-label="Less maximum discount" onClick={v.cap?.dec} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{v.cap?.v}</span>
                            <button type="button" className="ib" aria-label="More maximum discount" onClick={v.cap?.inc} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </button>
                          </div>
                          <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>taka</span>
                        </>) : null}
                      </div>
                      <__Err id="cp-amt-err" msg={v.errs?.amt} />
                    </>) : null}
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Name the code</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers type this. Keep it short and easy to say.</p>
                      </div>
                    </div>
                    <label className="lbl" htmlFor="cp-code" style={{ marginBottom: "-8px" }}>Code<__Req /></label>
                    <div className="cp-coderow" style={{ display: "flex", gap: "10px" }}>
                      <input id="cp-code" className="inp mono" value={v.code} onChange={v.typeCode} autoComplete="off" spellCheck="false" aria-required="true" {...__inv(v.errs?.code, "cp-code-err")} style={{ height: "52px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#003087", maxWidth: "360px" }} />
                      <button type="button" className="btn line big" onClick={v.autoCode}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                        <span>Make one for me</span>
                      </button>
                    </div>
                    <__Err id="cp-code-err" msg={v.errs?.code} />
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>3</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Who can use it?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }} />
                      </div>
                    </div>
                    <div className="lbl">Customers</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.whos).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div className="lbl">Products</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.prods).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>Only when the bill is at least</span>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                        <button type="button" className="ib" aria-label="Less minimum bill" onClick={v.minb?.dec} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{v.minb?.v}</span>
                        <button type="button" className="ib" aria-label="More minimum bill" onClick={v.minb?.inc} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>taka</span>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>4</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>How must they pay?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Make the offer work only for some payments, or give a different discount for each one.</p>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {__list(v.pmodes).map((o, $index) => (<React.Fragment key={$index}>
                          <button type="button" onClick={o?.pick} aria-pressed={o?.on} style={__sx(`text-align: left; padding: 14px; border-radius: var(--radius-xl); border: 1.5px solid ${o?.border ?? ""}; background: ${o?.bg ?? ""}; font: inherit; cursor: pointer; display: flex; align-items: flex-start; gap: 12px;`)}>
                            <span style={__sx(`width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; border-radius: var(--radius-full); border: 2px solid ${o?.ring ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                              <span style={__sx(`width: 10px; height: 10px; border-radius: var(--radius-full); background: ${o?.dot ?? ""};`)} />
                            </span>
                            <span>
                              <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{o?.label}</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{o?.sub}</span>
                            </span>
                          </button>
                        </React.Fragment>))}
                    </div>
                    {v.isOnline ? (<>
                      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="lbl">The code works when the customer pays with</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {__list(v.methods).map((m, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={m?.cls} aria-pressed={m?.on} onClick={m?.pick}>
                                {m?.on ? (<>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                </>) : null}
                                <span>{m?.label}</span>
                              </button>
                            </React.Fragment>))}
                        </div>
                        {v.showBanks ? (<>
                          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", borderRadius: "var(--radius-xl)", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#003087" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect width="20" height="12" x="2" y="6" rx="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <path d="M6 12h.01M18 12h.01" />
                                </svg>
                              </span>
                              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Which cards?</span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>For a bank partner offer, pick the bank.</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {__list(v.cardModes).map((c, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                                </React.Fragment>))}
                            </div>
                            {v.someBanks ? (<>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {__list(v.banks).map((b, $index) => (<React.Fragment key={$index}>
                                    <button type="button" className={b?.cls} aria-pressed={b?.on} onClick={b?.pick}>
                                      {b?.on ? (<>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                      </>) : null}
                                      <span>{b?.label}</span>
                                    </button>
                                  </React.Fragment>))}
                              </div>
                            </>) : null}
                          </div>
                        </>) : null}
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#075985", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>
                          <span style={{ flexShrink: "0" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4" />
                              <path d="M12 8h.01" />
                            </svg>
                          </span>
                          <span>Cash on delivery is hidden when this code is used. If the online payment fails, the code is removed and the customer can try again.</span>
                        </div>
                      </div>
                    </>) : null}
                    {v.isSplit ? (<>
                      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Give a bigger discount for the payment you like most. Turn off the ones that get nothing.</div>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                          {__list(v.split).map((r, $index) => (<React.Fragment key={$index}>
                              <div style={__sx(`display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-bottom: 1px solid #eef2f6; background: ${r?.bg ?? ""};`)}>
                                <span style={__sx(`min-width: 76px; height: 28px; padding: 0 10px; border-radius: var(--radius-lg); background: ${r?.mBg ?? ""}; color: ${r?.mFg ?? ""}; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{r?.label}</span>
                                <span style={__sx(`flex-grow: 1; font-size: var(--text-xs-plus); color: ${r?.noteColor ?? ""};`)}>{r?.note}</span>
                                {r?.showAmt ? (<>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                                      <button type="button" className="ib" aria-label={`Less discount for ${r?.label ?? ""}`} onClick={r?.dn} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M5 12h14" />
                                        </svg>
                                      </button>
                                      <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{r?.v}</span>
                                      <button type="button" className="ib" aria-label={`More discount for ${r?.label ?? ""}`} onClick={r?.up} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M5 12h14" />
                                          <path d="M12 5v14" />
                                        </svg>
                                      </button>
                                    </div>
                                    <span style={{ minWidth: "48px", fontSize: "var(--text-xs-plus)", color: "#334155" }}>{r?.unit}</span>
                                  </span>
                                </>) : null}
                                <button type="button" role="switch" aria-checked={r?.on} aria-label={`Discount for ${r?.label ?? ""}`} className={r?.swCls} onClick={r?.toggle} />
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </>) : null}
                    {v.isCod ? (<>
                      <div className="fade" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#fff4e0", color: "#7a3b04", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>
                        <span style={{ flexShrink: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </span>
                        <span>Good for areas where people trust cash more. Online payments will not get this discount.</span>
                      </div>
                    </>) : null}
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>5</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Where can they use it?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.wheres).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>6</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>When, and how many times?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }} />
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Starts<__Req /></span>
                        <input id="cp-start" className="inp" type="date" aria-label="Start date" value={v.dStart} onChange={v.typeStart} aria-required="true" {...__inv(v.errs?.start, "cp-start-err")} />
                        <__Err id="cp-start-err" msg={v.errs?.start} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Ends</span>
                        <input id="cp-end" className="inp" type="date" aria-label="End date" value={v.dEnd} onChange={v.typeEnd} aria-describedby={v.errs?.end ? "cp-end-err" : "cp-end-help"} {...(v.errs?.end ? { "aria-invalid": "true" } : {})} />
                        <__Err id="cp-end-err" msg={v.errs?.end} />
                        <span id="cp-end-help" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Leave empty to keep it on always.</span>
                      </label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>Stop after it is used</span>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                        <button type="button" className="ib" aria-label="Less use limit" onClick={v.lim?.dec} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{v.lim?.v}</span>
                        <button type="button" className="ib" aria-label="More use limit" onClick={v.lim?.inc} style={{ borderRadius: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ fontSize: "var(--text-sm)", color: "#334155" }}>times in total</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>One time per customer</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Checked by phone number</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.once?.on} aria-label="One time per customer" className={v.once?.cls} onClick={v.once?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Can join with other offers</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>For example with a flash sale price or points</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.stack?.on} aria-label="Can join with other offers" className={v.stack?.cls} onClick={v.stack?.toggle} />
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>7</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Offer post on your website</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{"Every offer gets its own post on the Offers & Promotions page, with a day counter. After the end date it shows as “Ended”."}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{"Show on the Offers & Promotions page"}</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers find the offer by themselves — no need to send an SMS.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.onPage?.on} aria-label={"Show on the Offers & Promotions page"} className={v.onPage?.cls} onClick={v.onPage?.toggle} />
                    </div>
                    {v.onPage?.on ? (<>
                      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px", borderRadius: "var(--radius-xl)", background: "#fbfcfe", border: "1px solid #e2e8f0" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Post title<__Req /></span>
                          <input id="cp-title" className="inp" aria-label="Post title" value={v.postTitle} onChange={v.typeTitle} aria-required="true" {...__inv(v.errs?.title, "cp-title-err")} style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }} />
                          <__Err id="cp-title-err" msg={v.errs?.title} />
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Link: gridshop.com.bd/offers/{v.slug}</span>
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="lbl">Featured image</span>
                          {v.noImg ? (<>
                            <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                              <button type="button" onClick={v.upload} style={{ height: "200px", borderRadius: "var(--radius-lg)", border: "2px dashed #94a3b8", background: "#f8fafc", font: "inherit", color: "#475569", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <path d="M17 8 12 3 7 8" />
                                  <path d="M12 3v12" />
                                </svg>
                                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Upload a picture</span>
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>JPG or PNG · 1200 × 630 is best</span>
                              </button>
                              <button type="button" onClick={v.useAuto} style={{ height: "200px", borderRadius: "var(--radius-lg)", border: "1.5px solid #e2e8f0", background: "#ffffff", font: "inherit", cursor: "pointer", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ flexGrow: "1", width: "100%", borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, #012169, #0a5bd0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.bigGets}</span>
                                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>No picture? Use a ready cover</span>
                              </button>
                            </div>
                          </>) : null}
                          {v.hasImg ? (<>
                            <div className="fade cp-img" style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>
                              <div style={__sx(`width: 380px; max-width: 100%; height: 200px; flex-shrink: 0; border-radius: var(--radius-xl); overflow: hidden; background: ${v.imgBg ?? ""}; color: #fff; position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 18px;`)}>
                                <span style={{ position: "absolute", top: "12px", left: "12px", height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.22)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.imgTag}</span>
                                <span style={{ fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.imgText}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{v.imgName}</div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.imgNote}</div>
                                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                  <button type="button" className="btn line sm" onClick={v.upload}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <path d="M17 8 12 3 7 8" />
                                      <path d="M12 3v12" />
                                    </svg>
                                    <span>Change</span>
                                  </button>
                                  <button type="button" className="btn line sm" onClick={v.removeImg}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                                    </svg>
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>) : null}
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <span className="lbl" style={{ flexGrow: "1" }}>Short description</span>
                            <span style={__sx(`font-size: var(--text-xs); color: ${v.sdColor ?? ""};`)}>{v.sdCount}</span>
                          </span>
                          <textarea className="inp bn" rows="2" aria-label="Short description" value={v.sd} onChange={v.typeSd} style={{ height: "auto", padding: "12px 14px", lineHeight: "22px", resize: "none" }} />
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>One or two lines. Shown on the offer card and on the coupon at checkout.</span>
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label className="lbl" htmlFor="cp-full">Full description</label>
                          <div style={{ display: "flex", gap: "2px", padding: "6px", border: "1px solid #cbd5e1", borderBottom: "0", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", background: "#f8fafc" }}>
                            <button type="button" className="ib" aria-label="Bold" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}><__Icon name="bold" width="16" height="16" aria-hidden="true" /></button>
                            <button type="button" className="ib" aria-label="Italic" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}><__Icon name="italic" width="16" height="16" aria-hidden="true" /></button>
                            <button type="button" className="ib" aria-label="List" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect width="8" height="4" x="8" y="2" rx="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <path d="M12 11h4" />
                                <path d="M12 16h4" />
                                <path d="M8 11h.01" />
                                <path d="M8 16h.01" />
                              </svg>
                            </button>
                            <button type="button" className="ib" aria-label="Add link" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </button>
                            <button type="button" className="ib" aria-label="Add picture" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </button>
                          </div>
                          <textarea id="cp-full" className="inp bn" rows="7" style={{ height: "auto", padding: "12px 14px", lineHeight: "24px", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", resize: "vertical" }} defaultValue={v.fullDesc} />
                          <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Tell the story of the offer. Bangla and English both work. Terms are added below the post by themselves.</span>
                        </div>
                      </div>
                    </>) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                          <path d="M9 9h.01" />
                          <path d="m15 9-6 6" />
                          <path d="M15 15h.01" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show at checkout as a ready coupon</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers tap it to use it. Turn off to keep the code secret (they must type it).</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.atCheckout?.on} aria-label="Show at checkout as a ready coupon" className={v.atCheckout?.cls} onClick={v.atCheckout?.toggle} />
                    </div>
                  </section>
                </div>
                <aside className="gc-side" style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0" }}>
                  <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="lbl">Customer will see</div>
                    <div style={{ position: "relative", display: "flex", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "linear-gradient(135deg, #012169 0%, #003087 55%, #0a5bd0 100%)", color: "#fff" }}>
                      <div style={{ flexGrow: "1", padding: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ fontSize: "var(--text-3xl)", lineHeight: "36px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.bigGets}</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", opacity: ".85" }}>{v.smallRule}</div>
                        <div style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>{v.endTxt}</div>
                      </div>
                      <div style={{ width: "112px", borderLeft: "2px dashed rgba(255,255,255,.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", padding: "10px" }}>
                        <span style={{ fontSize: "var(--text-xs)", opacity: ".8" }}>USE CODE</span>
                        <span className="mono" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", wordBreak: "break-all", textAlign: "center" }}>{v.code}</span>
                      </div>
                      <span style={{ position: "absolute", top: "-10px", right: "102px", width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                      <span style={{ position: "absolute", bottom: "-10px", right: "102px", width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                    </div>
                    <button type="submit" className="btn solid big">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Save and turn on</span>
                    </button>
                    <__Link href="/coupons" className="btn line">Cancel</__Link>
                  </section>
                </aside>
              </form>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
