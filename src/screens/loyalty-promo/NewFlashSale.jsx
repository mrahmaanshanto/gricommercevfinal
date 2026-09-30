'use client';
// Generated from design/templates/loyalty-promo/NewFlashSale.dc.html by scripts/convert-design.mjs.
// NewFlashSale — Loyalty, rewards & promo — New flash sale.
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
var P = [
  { id: 1, name: 'Denim Jeans · Blue · 32', code: '8941200200214', mrp: 1890, cost: 1150, price: 1290, qty: 40 },
  { id: 2, name: 'Men’s Polo Shirt · Navy · M', code: '8941200100118', mrp: 1450, cost: 780, price: 990, qty: 60 },
  { id: 3, name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', mrp: 1250, cost: 936, price: 890, qty: 30 },
  { id: 4, name: 'Cotton T-shirt · Black · M', code: '8941200300311', mrp: 590, cost: 290, price: 399, qty: 80 }
];
var EXTRA = { id: 5, name: 'Rice Water Cleanser 150ml', code: '8941100500341', mrp: 890, cost: 426, price: 690, qty: 25 };
var WHENS = [{ k: 'tonight', label: 'Tonight 6:00 PM – 12:00 AM', s: '18 Sep 2026, 6:00 PM', e: '18 Sep 2026, 11:59 PM', c: ['00', '05', '48', '10'] }, { k: 'weekend', label: 'This weekend', s: '18 Sep 2026, 6:00 PM', e: '20 Sep 2026, 11:59 PM', c: ['02', '06', '14', '22'] }, { k: 'three', label: '3 days', s: '19 Sep 2026, 12:00 AM', e: '21 Sep 2026, 11:59 PM', c: ['03', '00', '00', '00'] }, { k: 'own', label: 'Pick dates', s: '22 Sep 2026, 12:00 AM', e: '28 Sep 2026, 11:59 PM', c: ['--', '--', '--', '--'] }];

var NOW0 = Date.UTC(2026, 8, 18, 6, 14, 0); // 18 Sep 2026, 12:14 PM Dhaka
function TT(d, m, h, mi) { return Date.UTC(2026, m - 1, d, h - 6, mi || 0, 0); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function partsOf(ms) { if (ms < 0) ms = 0; var x = Math.floor(ms / 1000); return { d: Math.floor(x / 86400), h: Math.floor(x % 86400 / 3600), m: Math.floor(x % 3600 / 60), s: x % 60 }; }
var WDAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function whenOf(t) { var d = new Date(t + 6 * 3600000), h = d.getUTCHours(), ap = h < 12 ? 'am' : 'pm'; return WDAY[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' + ((h % 12) || 12) + ':' + pad2(d.getUTCMinutes()) + ' ' + ap; }
var TIMES = { tonight: [TT(18, 9, 18), TT(18, 9, 23, 59)], weekend: [TT(18, 9, 18), TT(20, 9, 23, 59)], three: [TT(19, 9, 0), TT(21, 9, 23, 59)], own: [TT(22, 9, 0), TT(28, 9, 23, 59)] };
var LEADS = [{ k: 'at', label: 'At the start', ms: 0 }, { k: 'h6', label: '6 hours before', ms: 6 * 3600000 }, { k: 'd1', label: '1 day before', ms: 86400000 }, { k: 'd3', label: '3 days before', ms: 3 * 86400000 }];
// catalogue the finder searches · exp = days to expiry, noSale = days since last sale, sold30 = pieces in 30 days, age = days since it arrived, other = in another running sale
var CAT = [
  { id: 101, name: 'Vitamin C Serum 30ml', code: '8941100500419', cat: 'Skin care', brand: 'Kioraa', mrp: 1650, cost: 820, stock: 34, exp: 21, sold30: 9, noSale: 6, age: 210, bg: '#fff4e0' },
  { id: 102, name: 'Snail Repair Cream 50ml', code: '8941100500426', cat: 'Skin care', brand: 'Kioraa', mrp: 2450, cost: 1300, stock: 18, exp: 38, sold30: 4, noSale: 11, age: 260, bg: '#fde7ef' },
  { id: 103, name: 'Aloe Soothing Gel 300ml', code: '8941100500433', cat: 'Skin care', brand: 'Kioraa', mrp: 690, cost: 310, stock: 120, exp: 54, sold30: 22, noSale: 1, age: 300, bg: '#e7f8f1' },
  { id: 104, name: 'Mango Juice 1L · 12 pack', code: '8941300100127', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 1440, cost: 1050, stock: 46, exp: 12, sold30: 30, noSale: 2, age: 40, bg: '#fff4e0' },
  { id: 105, name: 'Basmati Rice 5kg', code: '8941300100134', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 1180, cost: 930, stock: 210, exp: 160, sold30: 64, noSale: 1, age: 90, bg: '#eef2f6' },
  { id: 106, name: 'Greek Yogurt 500g', code: '8941300100141', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 320, cost: 210, stock: 58, exp: 6, sold30: 41, noSale: 1, age: 5, bg: '#e0f3fb' },
  { id: 107, name: 'Leather Jacket · Black · L', code: '8941200200412', cat: 'Clothing', brand: 'Aarong Basics', mrp: 7800, cost: 4300, stock: 9, exp: null, sold30: 1, noSale: 48, age: 320, bg: '#eef2f6' },
  { id: 108, name: 'Silk Saree · Maroon', code: '8941200200429', cat: 'Clothing', brand: 'Aarong Basics', mrp: 5400, cost: 2600, stock: 14, exp: null, sold30: 3, noSale: 19, age: 150, bg: '#fde7ef' },
  { id: 109, name: 'Winter Hoodie · Grey · M', code: '8941200200436', cat: 'Clothing', brand: 'Aarong Basics', mrp: 1950, cost: 900, stock: 140, exp: null, sold30: 5, noSale: 63, age: 280, bg: '#eef2f6' },
  { id: 110, name: 'Kids Raincoat · Yellow', code: '8941200200443', cat: 'Clothing', brand: 'Aarong Basics', mrp: 890, cost: 380, stock: 95, exp: null, sold30: 2, noSale: 71, age: 400, bg: '#fff4e0' },
  { id: 111, name: 'Bluetooth Earbuds Pro', code: '8941400100118', cat: 'Electronics', brand: 'SoundBD', mrp: 3490, cost: 2100, stock: 26, exp: null, sold30: 18, noSale: 1, age: 14, bg: '#e0f3fb' },
  { id: 112, name: 'Smart Watch S2', code: '8941400100125', cat: 'Electronics', brand: 'SoundBD', mrp: 6200, cost: 4100, stock: 12, exp: null, sold30: 6, noSale: 4, age: 22, bg: '#eef2f6' },
  { id: 113, name: 'Power Bank 20000mAh', code: '8941400100132', cat: 'Electronics', brand: 'SoundBD', mrp: 2250, cost: 1380, stock: 80, exp: null, sold30: 55, noSale: 1, age: 180, bg: '#e7f8f1' },
  { id: 114, name: 'Linen Kurta · White · L', code: '8941200200450', cat: 'Clothing', brand: 'Aarong Basics', mrp: 2100, cost: 820, stock: 60, exp: null, sold30: 38, noSale: 1, age: 8, bg: '#f2f6ff' },
  { id: 115, name: 'Cotton T-shirt · Black · M', code: '8941200300311', cat: 'Clothing', brand: 'Aarong Basics', mrp: 590, cost: 290, stock: 80, exp: null, sold30: 120, noSale: 1, age: 200, bg: '#eef2f6', other: 'Weekend Mega Sale' }
];
var CRITS = [
  { k: 'expiring', label: 'Expiring soon', dot: '#ff5724', note: 'Within 60 days', test: function (p) { return p.exp != null && p.exp <= 60; }, sort: function (a, b) { return a.exp - b.exp; } },
  { k: 'value', label: 'High value', dot: '#003087', note: '৳2,500 and up', test: function (p) { return p.mrp >= 2500; }, sort: function (a, b) { return b.mrp * b.stock - a.mrp * a.stock; } },
  { k: 'slow', label: 'Slow moving', dot: '#ff9800', note: 'No sale 45+ days', test: function (p) { return p.noSale >= 45; }, sort: function (a, b) { return b.noSale - a.noSale; } },
  { k: 'over', label: 'Overstock', dot: '#a855f7', note: '90+ days of stock', test: function (p) { return cover(p) >= 90; }, sort: function (a, b) { return cover(b) - cover(a); } },
  { k: 'best', label: 'Best sellers', dot: '#10b981', note: 'Pull people in', test: function (p) { return p.sold30 >= 30; }, sort: function (a, b) { return b.sold30 - a.sold30; } },
  { k: 'margin', label: 'Big margin', dot: '#009cde', note: '45%+ margin', test: function (p) { return marginOf(p) >= 45; }, sort: function (a, b) { return marginOf(b) - marginOf(a); } },
  { k: 'new', label: 'New arrivals', dot: '#0070a0', note: 'Last 30 days', test: function (p) { return p.age <= 30; }, sort: function (a, b) { return a.age - b.age; } },
  { k: 'all', label: 'All products', dot: '#94a3b8', note: 'Everything', test: function () { return true; }, sort: function (a, b) { return a.name < b.name ? -1 : 1; } }
];
function cover(p) { return p.sold30 ? Math.round(p.stock / (p.sold30 / 30)) : 999; }
function marginOf(p) { return Math.round((p.mrp - p.cost) / p.mrp * 100); }
function suggestPct(p, k) {
  if (k === 'expiring') return p.exp <= 10 ? 40 : p.exp <= 30 ? 30 : 20;
  if (k === 'slow') return p.noSale >= 60 ? 35 : 25;
  if (k === 'over') return 25; if (k === 'margin') return 25; if (k === 'value') return 15; if (k === 'best' || k === 'new') return 10; return 20;
}
function whyOf(p, k) {
  var ed = new Date(NOW0 + 6 * 3600000 + (p.exp || 0) * 86400000);
  var map = {
    expiring: [p.exp != null ? 'Expires in ' + p.exp + ' days' : 'No expiry', p.exp != null ? 'Best before ' + ed.getUTCDate() + ' ' + MONTHS[ed.getUTCMonth()] + ' ' + ed.getUTCFullYear() : '', p.exp != null && p.exp <= 14 ? ['#ffece6', '#b83210'] : ['#fff4e0', '#a14f06']],
    value: ['৳' + p.mrp.toLocaleString('en-IN') + ' each', 'Stock worth ' + bdt(p.mrp * p.stock), ['rgba(0,48,135,.08)', '#003087']],
    slow: ['No sale in ' + p.noSale + ' days', p.sold30 + ' sold in 30 days', ['#fff4e0', '#a14f06']],
    over: [cover(p) >= 999 ? 'Not selling' : 'Stock for ' + cover(p) + ' days', p.stock + ' in stock · ' + p.sold30 + ' sold a month', ['#f3e8ff', '#7e22ce']],
    best: ['Sold ' + p.sold30 + ' in 30 days', 'Pulls customers to the sale', ['#e7f8f1', '#047857']],
    margin: ['Margin ' + marginOf(p) + '%', 'Room to cut the price', ['#e0f3fb', '#00567a']],
    'new': ['Arrived ' + p.age + ' days ago', 'Launch price for new stock', ['#e0f3fb', '#00567a']],
    all: [p.cat, p.brand, ['#eef2f6', '#475569']]
  };
  return map[k];
}
class Component extends DCLogic {
  componentDidMount() { var self = this; this.iv = setInterval(function () { self.setState({ tick: ((self.state && self.state.tick) || 0) + 1 }); }, 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  renderVals() {
    var self = this, s = this.state || {};
    var list = s.list || P.map(function (p) { return assign({}, p); });
    var upd = function (id, f) { self.setState({ list: list.map(function (p) { return p.id === id ? f(assign({}, p)) : p; }) }); };
    var wk = s.when || 'weekend', W = WHENS.filter(function (w) { return w.k === wk; })[0];
    var errs = s.errs || {};
    var title = s.title != null ? s.title : 'Weekend Mega Sale';
    // Start and end follow the chosen preset until the user types their own.
    var startTxt = s.startTxt != null ? s.startTxt : W.s, endTxt = s.endTxt != null ? s.endTxt : W.e;
    var tot = 0, losses = [];
    var items = list.map(function (p) {
      var pr = p.price - p.cost; tot += pr * p.qty; if (pr < 0) losses.push(p.name);
      return { name: p.name, code: p.code, initial: p.name.charAt(0), mrp: bdt(p.mrp), price: bdt(p.price), off: Math.round((1 - p.price / p.mrp) * 100) + '% off', qty: p.qty,
        profit: bdt(pr), pNote: pr < 0 ? 'Loss! Bought at ' + bdt(p.cost) : 'Bought at ' + bdt(p.cost), pColor: pr < 0 ? '#b83210' : '#047857', cls: p.fresh ? 'flash' : '',
        dn: function () { upd(p.id, function (x) { x.price = Math.max(10, x.price - 10); return x; }); }, up: function () { upd(p.id, function (x) { x.price = Math.min(x.mrp, x.price + 10); return x; }); },
        qdn: function () { upd(p.id, function (x) { x.qty = Math.max(1, x.qty - 5); return x; }); }, qup: function () { upd(p.id, function (x) { x.qty += 5; return x; }); },
        remove: function () { self.setState({ list: list.filter(function (x) { return x.id !== p.id; }) }); } };
    });
    var setPct = function (n) { return function () { self.setState({ list: list.map(function (p) { var x = assign({}, p); x.price = Math.round(x.mrp * (1 - n / 100) / 10) * 10; return x; }) }); }; };

    // ---- poster preview: counts down to the start, then shows when it ends
    var now = NOW0 + (s.tick || 0) * 1000, TW = TIMES[wk], pvk = s.pv || 'before', before = pvk === 'before';
    var cp = partsOf(before ? TW[0] - now : TW[1] - TW[0]), fg = '#b83210';
    var sp = mkSw(this, 'showPrices', true), rmd = mkSw(this, 'remind', true), soonP = mkSw(this, 'soonPoster', true);
    var lk = s.lead || 'd1', L = LEADS.filter(function (x) { return x.k === lk; })[0];
    // ---- product finder
    var crit = s.crit || 'expiring', C = CRITS.filter(function (x) { return x.k === crit; })[0], cat = s.cat || 'All';
    var hideO = mkSw(this, 'hideOther', true), inSale = {}; list.forEach(function (p) { inSale[p.code] = true; });
    var base = CAT.filter(function (p) { return (cat === 'All' || p.cat === cat) && !(hideO.on && p.other); });
    var cands = base.filter(C.test).sort(C.sort), sel = s.sel || {};
    var pick = cands.filter(function (p) { return sel[p.id] && !inSale[p.code]; });
    var sugOf = function (p) { var pc = suggestPct(p, crit), pr = Math.round(p.mrp * (1 - pc / 100) / 10) * 10, floor = Math.ceil(p.cost * 1.05 / 10) * 10, capped = pr < floor; return { pr: capped ? floor : pr, pc: capped ? Math.round((1 - floor / p.mrp) * 100) : pc, capped: capped }; };
    var selectable = cands.filter(function (p) { return !inSale[p.code]; }), allOn = selectable.length > 0 && selectable.every(function (p) { return sel[p.id]; });
    var add = function (arr) { var nid = 1000 + list.length; self.setState({ sel: {}, list: list.concat(arr.map(function (p, i) { var g = sugOf(p); return { id: nid + i, name: p.name, code: p.code, mrp: p.mrp, cost: p.cost, price: g.pr, qty: Math.min(p.stock, 20), fresh: true }; })) }); };
    return {
      errs: errs, itemsErr: list.length === 0 ? errs.items : '',
      title: title, typeTitle: function (e) { self.setState({ title: e.target.value, errs: __without(errs, 'title') }); },
      typeStart: function (e) { self.setState({ startTxt: e.target.value, errs: __without(__without(errs, 'start'), 'end') }); },
      typeEnd: function (e) { self.setState({ endTxt: e.target.value, errs: __without(errs, 'end') }); },
      feat: mkSw(this, 'feat', true), onPage: mkSw(this, 'onPage', true), lim1: mkSw(this, 'lim1', true), stack: mkSw(this, 'stack', false),
      whens: mkChips(this, WHENS, wk, 'when').map(function (c, i) { c.pick = function () { self.setState({ when: WHENS[i].k, startTxt: null, endTxt: null, errs: __without(__without(errs, 'start'), 'end') }); }; return c; }), startTxt: startTxt, endTxt: endTxt,

      clock: [{ v: pad2(cp.d), l: 'days' }, { v: pad2(cp.h), l: 'hours' }, { v: pad2(cp.m), l: 'min' }, { v: pad2(cp.s), l: 'sec' }],
      pvTabs: [{ k: 'before', label: 'Before it starts' }, { k: 'live', label: 'Once it starts' }].map(function (t) { var on = t.k === pvk; return { label: t.label, on: on ? 'true' : 'false', cls: on ? 'pvtab on' : 'pvtab', pick: function () { self.setState({ pv: t.k }); } }; }),
      pvNow: before ? 'Now: ' + whenOf(now).split(', ')[1] + ', ' + whenOf(now).split(', ')[0] : 'At ' + whenOf(TW[0]),
      pvCover: before ? 'linear-gradient(135deg, #012169, #7c3aed)' : 'linear-gradient(135deg, #b83210, #f59e0b)', pvFg: before ? '#3b0f8c' : fg,
      pvPill: before ? 'COMING SOON' : 'LIVE NOW', pvIsLive: !before, pvShowRemind: before && rmd.on,
      pvWhen: before ? 'Starts ' + whenOf(TW[0]) : 'Ends ' + whenOf(TW[1]),
      pvClockLabel: before ? 'STARTS IN' : 'ENDS IN',
      pvHelp: before ? (soonP.on ? 'Goes up on the Offers page ' + (L.ms ? whenOf(TW[0] - L.ms) : 'at the start time') + '. At ' + whenOf(TW[0]).split(', ')[1] + ' the countdown switches to the end time by itself.' : 'The “Coming soon” poster is off. The sale appears on the Offers page at the start time.') : 'From the start time the poster counts down to ' + whenOf(TW[1]) + ', then moves to “Ended” by itself and prices go back to normal.',
      previews: list.slice(0, 2).map(function (p) { var hide = before && !sp.on; return { initial: p.name.charAt(0), name: p.name, price: hide ? bdt(p.mrp) : bdt(p.price), mrp: hide ? '' : bdt(p.mrp), off: '−' + Math.round((1 - p.price / p.mrp) * 100) + '%', tagBg: before ? '#334155' : fg, priceFg: before ? '#0f172a' : fg, locked: before, lockText: hide ? 'Price drops at the start' : 'Sale price from ' + whenOf(TW[0]).split(', ')[0].replace(/^\w+ /, '') }; }),
      soonPoster: soonP, remind: rmd, showPrices: sp,
      leads: mkChips(this, LEADS, lk, 'lead'),
      leadText: L.ms ? 'Poster goes up ' + whenOf(TW[0] - L.ms) + ' and counts down to ' + whenOf(TW[0]) + '.' : 'Poster goes up at ' + whenOf(TW[0]) + ' and shows only the end time.',
      finderOpen: s.finder == null ? true : s.finder, finderBtn: (s.finder == null || s.finder) ? 'Hide' : 'Find products', finderToggle: function () { self.setState({ finder: !(s.finder == null ? true : s.finder) }); },
      crits: CRITS.map(function (c) { var on = c.k === crit, n = base.filter(c.test).length; return { label: c.label, note: c.note, dot: c.dot, count: n, on: on ? 'true' : 'false', cls: on ? 'crit on' : 'crit', pick: function () { self.setState({ crit: c.k, sel: {} }); } }; }),
      cats: ['All', 'Skin care', 'Clothing', 'Grocery', 'Electronics'].map(function (c) { var on = c === cat; return { label: c === 'All' ? 'All categories' : c, on: on ? 'true' : 'false', cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ cat: c, sel: {} }); } }; }),
      hideOther: hideO, critHint: cands.length + ' match · sorted by ' + { expiring: 'soonest expiry', value: 'stock value', slow: 'longest without a sale', over: 'most days of stock', best: 'most sold', margin: 'biggest margin', 'new': 'newest', all: 'name' }[crit],
      cands: cands.map(function (p) { var w = whyOf(p, crit), g = sugOf(p), had = !!inSale[p.code], on = !!sel[p.id] || had, pr = g.pr - p.cost;
        return { name: p.name, initial: p.name.charAt(0), bg: p.bg, meta: p.cat + ' · ' + p.stock + ' in stock' + (p.other ? ' · in ' + p.other : ''), why: w[0], whySub: had ? 'Already in this sale' : w[1], whyBg: w[2][0], whyFg: w[2][1],
          stock: p.stock, mrp: bdt(p.mrp), sug: bdt(g.pr), sugOff: '−' + g.pc + '%', sugNote: g.capped ? 'Kept above buying price' : 'Bought at ' + bdt(p.cost), profit: bdt(pr), pFg: pr < 0 ? '#b83210' : '#047857',
          on: on ? 'true' : 'false', inSale: had ? 'true' : 'false', cbx: had ? 'cbx on dis' : on ? 'cbx on' : 'cbx', op: had ? 0.6 : 1,
          toggle: function () { if (had) return; var x = assign({}, sel); x[p.id] = !sel[p.id]; self.setState({ sel: x }); } }; }),
      noCands: cands.length === 0,
      allCbx: allOn ? 'cbx on' : 'cbx', allOn: allOn ? 'true' : 'false',
      toggleAll: function () { var x = {}; if (!allOn) selectable.forEach(function (p) { x[p.id] = true; }); self.setState({ sel: x }); },
      selText: pick.length ? pick.length + ' selected · if all sell, profit ' + bdt(pick.reduce(function (a, p) { return a + (sugOf(p).pr - p.cost) * Math.min(p.stock, 20); }, 0)) : 'Tick products to add them with the suggested price. You can change each price below.',
      noSel: pick.length ? 'false' : 'true', addText: pick.length ? 'Add ' + pick.length + ' to this sale' : 'Add to this sale',
      addSel: function () { if (pick.length) add(pick); }, clearSel: function () { self.setState({ sel: {} }); },
      pcts: [10, 20, 30, 40].map(function (n) { return { label: n + '%', on: false, cls: 'chip', pick: setPct(n) }; }),
      items: items,
      addOne: function () { if (list.some(function (p) { return p.id === 5; })) return; var e = assign({}, EXTRA); e.fresh = true; self.setState({ list: list.concat([e]) }); },
      nItems: list.length, nPieces: list.reduce(function (a, p) { return a + p.qty; }, 0), totProfit: bdt(tot), totColor: tot < 0 ? '#b83210' : '#047857',
      hasLoss: losses.length > 0, lossText: losses.join(', ') + (losses.length > 1 ? ' are' : ' is') + ' below your buying price. Raise the sale price, or keep it on purpose to bring customers in.',
      // Validate, show each problem under its field, focus the first one; only a valid form saves.
      submit: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var er = {}, first = null, add = function (k, id, m) { er[k] = m; if (!first) first = id; };
        if (!title.trim()) add('title', 'fs-title', 'Enter a name for the sale.');
        if (!startTxt.trim()) add('start', 'fs-start', 'Enter when the sale starts.');
        if (!endTxt.trim()) add('end', 'fs-end', 'Enter when the sale ends.');
        var t0 = Date.parse(startTxt), t1 = Date.parse(endTxt);
        if (!er.start && !er.end && !isNaN(t0) && !isNaN(t1) && t1 <= t0) add('end', 'fs-end', 'The end must be after the start.');
        if (list.length === 0) add('items', 'fs-scan', 'Add at least one product to the sale.');
        if (first) { self.setState({ errs: er }); __focusSoon(first); return; }
        self.setState({ errs: {} });
        __toast(title.trim() + ' is scheduled. It starts ' + startTxt.trim() + ' and prices change back by themselves.');
      }
    };
  }
}
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

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

.finder{border:1px solid #dbe3ee;border-radius:var(--radius-xl);background:#f8fafc;overflow:hidden}
.crit{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;padding:10px 12px;border:1px solid #dbe3ee;border-radius:var(--radius-xl);background:#fff;font:inherit;text-align:left;cursor:pointer;transition:border-color 200ms,background-color 200ms}
.crit:hover{border-color:#94a3b8}.crit.on{border-color:#003087;background:#f2f6ff;box-shadow:0 0 0 1px #003087}
.crit:focus-visible,.cbx:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.critT{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#0f172a;display:flex;align-items:center;gap:6px;white-space:nowrap}
.critN{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.cbx{width:20px;height:20px;border-radius:var(--radius-md);border:2px solid #94a3b8;background:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer;color:#fff;flex-shrink:0}
.cbx.on{background:#003087;border-color:#003087}.cbx.dis{background:#e2e8f0;border-color:#cbd5e1;cursor:default}
.why{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.fsel{height:36px;padding:0 10px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-xs-plus);color:#1e293b}
.pvtab{flex:1;height:36px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer}
.pvtab.on{background:#fff;color:#003087;box-shadow:0 1px 2px rgba(15,23,42,.12)}
`;

// ---- markup ----

export default class NewFlashSaleScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewFlashSale">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="promo-flash" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Promo / Flash sales" page="Start a flash sale" placeholder="Search a sale" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Start a flash sale" />
              <form noValidate onSubmit={v.submit} aria-label="New flash sale" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Name and picture</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Shown on top of the sale page.</p>
                      </div>
                    </div>
                    <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "16px", alignItems: "start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Sale name<__Req /></span>
                          <input id="fs-title" className="inp" value={v.title} onChange={v.typeTitle} aria-label="Sale name" aria-required="true" {...__inv(v.errs?.title, "fs-title-err")} />
                          <__Err id="fs-title-err" msg={v.errs?.title} />
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show on home page</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>A big banner with the countdown</div>
                          </div>
                          <button type="button" role="switch" aria-checked={v.feat?.on} aria-label="Show on home page" className={v.feat?.cls} onClick={v.feat?.toggle} />
                        </div>
                      </div>
                      <button type="button" style={{ height: "124px", borderRadius: "var(--radius-lg)", border: "2px dashed #94a3b8", background: "#f8fafc", font: "inherit", color: "#475569", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M17 8 12 3 7 8" />
                          <path d="M12 3v12" />
                        </svg>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Add banner picture</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>1200 × 400, JPG or PNG</span>
                      </button>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>When does it run?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>The price goes back to normal by itself when time is up.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.whens).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Starts<__Req /></span>
                        <input id="fs-start" className="inp" value={v.startTxt} onChange={v.typeStart} aria-label="Starts" aria-required="true" {...__inv(v.errs?.start, "fs-start-err")} />
                        <__Err id="fs-start-err" msg={v.errs?.start} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Ends<__Req /></span>
                        <input id="fs-end" className="inp" value={v.endTxt} onChange={v.typeEnd} aria-label="Ends" aria-required="true" {...__inv(v.errs?.end, "fs-end-err")} />
                        <__Err id="fs-end-err" msg={v.errs?.end} />
                      </label>
                    </div>
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>3</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Which products, and at what price?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Profit is checked with your buying price, so you never sell at a loss by mistake.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <label style={{ position: "relative", flexGrow: "1" }}>
                        <span style={{ position: "absolute", left: "16px", top: "15px", color: "#003087" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <path d="M8 7v10" />
                            <path d="M12 7v10" />
                            <path d="M17 7v10" />
                          </svg>
                        </span>
                        <input id="fs-scan" className="inp" type="search" placeholder="Scan barcode or type product name" aria-label="Scan barcode or type product name" {...__inv(v.itemsErr, "fs-items-err")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); v.addOne(); } }} style={{ height: "54px", paddingLeft: "50px", fontSize: "var(--text-sm-plus)", border: "2px solid #003087" }} />
                      </label>
                      <button type="button" className="btn solid big" onClick={v.addOne}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <span>Add product</span>
                      </button>
                    </div>
                    <div className="finder finderBlock">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                        <span style={{ color: "#003087" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m12 3-1.9 5.8L4 10.8l4.9 3.6L7 21l5-3.6 5 3.6-1.9-6.6 4.9-3.6-6.1-2Z" />
                          </svg>
                        </span>
                        <div style={{ flexGrow: "1" }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Find products to put on sale</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Pick a reason, narrow it down, tick what you want. Each product comes in with a suggested sale price that never goes below your buying price.</div>
                        </div>
                        <button type="button" className="btn line sm" onClick={v.finderToggle} aria-expanded={v.finderOpen}>{v.finderBtn}</button>
                      </div>
                      {v.finderOpen ? (<>
                        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div role="radiogroup" aria-label="Why put it on sale" className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
                            {__list(v.crits).map((c, $index) => (<React.Fragment key={$index}>
                                <button type="button" role="radio" aria-checked={c?.on} className={c?.cls} onClick={c?.pick}>
                                  <span className="critT"><span style={__sx(`width: 8px; height: 8px; border-radius: var(--radius-full); background: ${c?.dot ?? ""};`)} />{c?.label}<span style={{ marginLeft: "2px", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{c?.count}</span></span>
                                  <span className="critN">{c?.note}</span>
                                </button>
                              </React.Fragment>))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span className="lbl" style={{ marginRight: "2px" }}>Category</span>
                            {__list(v.cats).map((c, $index) => (<React.Fragment key={$index}>
                                <button type="button" className={c?.cls} onClick={c?.pick} aria-pressed={c?.on} style={{ height: "36px", padding: "0 12px" }}>{c?.label}</button>
                              </React.Fragment>))}
                          </div>
                          <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Brand<select className="fsel" aria-label="Brand">
  <option>All brands</option>
  <option>Kioraa</option>
  <option>Aarong Basics</option>
  <option>Deshi Fresh</option>
  <option>SoundBD</option>
</select></label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Stock at least<select className="fsel" aria-label="Stock at least">
  <option>5 pieces</option>
  <option>1 piece</option>
  <option>20 pieces</option>
  <option>50 pieces</option>
</select></label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Price<select className="fsel" aria-label="Price">
  <option>Any price</option>
  <option>Under ৳500</option>
  <option>৳500 – ৳2,000</option>
  <option>Over ৳2,000</option>
</select></label>
                            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Warehouse<select className="fsel" aria-label="Warehouse">
  <option>All warehouses</option>
  <option>Dhanmondi branch</option>
  <option>Mirpur godown</option>
</select></label>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)", color: "#334155" }}>
                            <button type="button" role="switch" aria-checked={v.hideOther?.on} aria-label="Hide products already in another sale" className={v.hideOther?.cls} onClick={v.hideOther?.toggle} style={{ transform: "scale(.85)" }} />
                            <span>Hide products already in another running sale</span>
                            <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>{v.critHint}</span>
                          </div>
                          <div role="group" aria-label="Matching products" style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#fff" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1.25fr) minmax(0, 1fr) 128px", gap: "12px", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                              <button type="button" className={v.allCbx} role="checkbox" aria-checked={v.allOn} aria-label="Select all shown" onClick={v.toggleAll}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </button>
                              <span>Product</span>
                              <span>Why it fits</span>
                              <span style={{ textAlign: "right" }}>Suggested price</span>
                            </div>
                            {__list(v.cands).map((r, $index) => (<React.Fragment key={$index}>
                                <div className="row" style={__sx(`display: grid; grid-template-columns: 24px minmax(0, 1.25fr) minmax(0, 1fr) 128px; gap: 12px; align-items: center; padding: 10px 14px; border-bottom: 1px solid #eef2f6; opacity: ${r?.op ?? ""};`)}>
                                  <button type="button" className={r?.cbx} role="checkbox" aria-checked={r?.on} aria-disabled={r?.inSale} aria-label={`Select ${r?.name ?? ""}`} onClick={r?.toggle}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                  </button>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                                    <span style={__sx(`width: 34px; height: 34px; flex-shrink: 0; border-radius: var(--radius-lg); background: ${r?.bg ?? ""}; color: #003087; display: flex; align-items: center; justify-content: center; font-weight: var(--weight-medium);`)}>{r?.initial}</span>
                                    <div style={{ minWidth: "0" }}>
                                      <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", lineHeight: "20px" }}>{r?.name}</div>
                                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r?.meta}</div>
                                    </div>
                                  </div>
                                  <div style={{ minWidth: "0" }}>
                                    <span className="why" style={__sx(`background: ${r?.whyBg ?? ""}; color: ${r?.whyFg ?? ""};`)}>{r?.why}</span>
                                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", marginTop: "3px" }}>{r?.whySub}</div>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <div>
                                      <span style={{ fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{r?.sug}</span>
                                      {" "}
                                      <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#b83210" }}>{r?.sugOff}</span>
                                    </div>
                                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>was {r?.mrp} · <span style={__sx(`color: ${r?.pFg ?? ""}; font-weight: var(--weight-medium);`)}>+{r?.profit}</span></div>
                                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{r?.sugNote}</div>
                                  </div>
                                </div>
                              </React.Fragment>))}
                            {v.noCands ? (<>
                              <div style={{ padding: "22px", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Nothing matches. Try another category or turn off “Hide products already in another running sale”.</div>
                            </>) : null}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "#334155" }}>{v.selText}</span>
                            <span style={{ flexGrow: "1" }} />
                            <button type="button" className="btn line sm" onClick={v.clearSel}>Clear</button>
                            <button type="button" className="btn solid sm" onClick={v.addSel} aria-disabled={v.noSel}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                              <span>{v.addText}</span>
                            </button>
                          </div>
                        </div>
                      </>) : null}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", color: "#334155" }}>
                      <span>Same discount for all:</span>
                      {__list(v.pcts).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} onClick={c?.pick}>{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div role="region" aria-label="Products in this sale" tabIndex="0" style={{ overflowX: "auto", margin: "0 -24px", padding: "0 24px" }}>
                      <table style={{ width: "100%", minWidth: "820px", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th" style={{ minWidth: "220px" }}>Product</th>
                            <th className="th" style={{ textAlign: "right" }}>Normal price</th>
                            <th className="th">Sale price</th>
                            <th className="th" style={{ textAlign: "right" }}>Profit per piece</th>
                            <th className="th">Pieces for sale</th>
                            <th className="th" />
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.items).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className={`row ${r?.cls ?? ""}`}>
                                <td className="td">
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)" }}>{r?.initial}</span>
                                    <div>
                                      <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                                      <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="td" style={{ textAlign: "right", color: "var(--text-muted)", textDecoration: "line-through" }}>{r?.mrp}</td>
                                <td className="td">
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                                      <button type="button" className="ib" aria-label={`Less sale price for ${r?.name ?? ""}`} onClick={r?.dn} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M5 12h14" />
                                        </svg>
                                      </button>
                                      <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{r?.price}</span>
                                      <button type="button" className="ib" aria-label={`More sale price for ${r?.name ?? ""}`} onClick={r?.up} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M5 12h14" />
                                          <path d="M12 5v14" />
                                        </svg>
                                      </button>
                                    </div>
                                    <span className="badge b-over" style={{ background: "#ffece6" }}>{r?.off}</span>
                                  </div>
                                </td>
                                <td className="td" style={{ textAlign: "right" }}>
                                  <div style={__sx(`font-weight: var(--weight-semibold); color: ${r?.pColor ?? ""};`)}>{r?.profit}</div>
                                  <div style={__sx(`font-size: var(--text-xs); color: ${r?.pColor ?? ""};`)}>{r?.pNote}</div>
                                </td>
                                <td className="td">
                                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                                    <button type="button" className="ib" aria-label={`Fewer pieces of ${r?.name ?? ""}`} onClick={r?.qdn} style={{ borderRadius: "0" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14" />
                                      </svg>
                                    </button>
                                    <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{r?.qty}</span>
                                    <button type="button" className="ib" aria-label={`More pieces of ${r?.name ?? ""}`} onClick={r?.qup} style={{ borderRadius: "0" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                                <td className="td">
                                  <button type="button" className="ib" aria-label={`Remove ${r?.name ?? ""}`} onClick={r?.remove}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                    <__Err id="fs-items-err" msg={v.itemsErr} />
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>4</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Limits and showing</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }} />
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
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers see it with a countdown. It moves to “Ended” by itself.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.onPage?.on} aria-label={"Show on the Offers & Promotions page"} className={v.onPage?.cls} onClick={v.onPage?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show a “Coming soon” poster before it starts</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>The poster counts down to the start time, then switches by itself to show when the sale ends.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.soonPoster?.on} aria-label="Show a Coming soon poster before it starts" className={v.soonPoster?.cls} onClick={v.soonPoster?.toggle} />
                    </div>
                    {v.soonPoster?.on ? (<>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", padding: "2px 0 12px 54px", borderBottom: "1px solid #eef2f6" }}>
                        <span className="lbl">Put the poster up</span>
                        {__list(v.leads).map((c, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "36px", padding: "0 12px" }}>{c?.label}</button>
                          </React.Fragment>))}
                        <span style={{ flexBasis: "100%", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.leadText}</span>
                      </div>
                    </>) : null}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Let customers ask for a reminder</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>A “Remind me” button on the poster. We send one SMS when the sale opens.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.remind?.on} aria-label="Let customers ask for a reminder" className={v.remind?.cls} onClick={v.remind?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show sale prices before it starts</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Off: the poster shows only the discount, and prices appear at the start time.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.showPrices?.on} aria-label="Show sale prices before it starts" className={v.showPrices?.cls} onClick={v.showPrices?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Max 2 pieces per customer</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>So more customers get the offer</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.lim1?.on} aria-label="Max 2 pieces per customer" className={v.lim1?.cls} onClick={v.lim1?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Discount codes also work</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Customers can add a code on top of the sale price</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.stack?.on} aria-label="Discount codes also work" className={v.stack?.cls} onClick={v.stack?.toggle} />
                    </div>
                  </section>
                </div>
                <aside className="gc-side" style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0" }}>
                  <section className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div className="lbl">Poster on the Offers page</div>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.pvNow}</span>
                    </div>
                    <div role="tablist" aria-label="Poster state" style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "var(--radius-lg)", background: "#eef2f6" }}>
                      {__list(v.pvTabs).map((t, $index) => (<React.Fragment key={$index}>
                          <button type="button" role="tab" aria-selected={t?.on} className={t?.cls} onClick={t?.pick}>{t?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <div style={__sx(`padding: 14px; background: ${v.pvCover ?? ""}; color: #fff;`)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.2)", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
</svg> FLASH SALE</span>
                          <span style={__sx(`display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: var(--radius-full); background: #fff; color: ${v.pvFg ?? ""}; font-size: var(--text-2xs); font-weight: var(--weight-medium);`)}>{v.pvPill}</span>
                        </div>
                        <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", marginTop: "6px" }}>{v.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", opacity: ".95" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          <span>{v.pvWhen}</span>
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", opacity: ".85" }}>{v.pvClockLabel}</div>
                        <div role="timer" style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          {__list(v.clock).map((k, $index) => (<React.Fragment key={$index}>
                              <div style={{ minWidth: "48px", padding: "6px 4px", borderRadius: "var(--radius-lg)", background: "rgba(15,23,42,.35)", textAlign: "center" }}>
                                <div className="mono" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{k?.v}</div>
                                <div style={{ fontSize: "var(--text-2xs)", opacity: ".85" }}>{k?.l}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                        {v.pvShowRemind ? (<>
                          <div style={__sx(`display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; height: 30px; padding: 0 12px; border-radius: var(--radius-lg); background: #fff; color: ${v.pvFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</svg>Remind me when it starts</div>
                        </>) : null}
                        {v.pvIsLive ? (<>
                          <div style={__sx(`display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; height: 30px; padding: 0 12px; border-radius: var(--radius-lg); background: #fff; color: ${v.pvFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>Shop the sale →</div>
                        </>) : null}
                      </div>
                      <div className="gc-cols-2" style={{ padding: "12px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "10px", background: "#fff" }}>
                        {__list(v.previews).map((p, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div style={{ height: "84px", borderRadius: "var(--radius-lg)", background: "#eef2f6", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", color: "#003087", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{p?.initial}<span style={__sx(`position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: var(--radius-md); background: ${p?.tagBg ?? ""}; color: #fff; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{p?.off}</span></div>
                              <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", marginTop: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name}</div>
                              <div style={__sx(`font-size: var(--text-sm); font-weight: var(--weight-semibold); color: ${p?.priceFg ?? ""};`)}>{p?.price} <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)", textDecoration: "line-through" }}>{p?.mrp}</span></div>
                              {p?.locked ? (<>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "3px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg>{p?.lockText}</div>
                              </>) : null}
                            </div>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{v.pvHelp}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px", borderRadius: "var(--radius-xl)", background: "#f8fafc", fontSize: "var(--text-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>Products</span>
                        <b>{v.nItems}</b>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>Pieces for sale</span>
                        <b>{v.nPieces}</b>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#475569" }}>If all are sold, profit</span>
                        <b style={__sx(`color: ${v.totColor ?? ""};`)}>{v.totProfit}</b>
                      </div>
                    </div>
                    {v.hasLoss ? (<>
                      <div className="fade" role="alert" style={{ display: "flex", gap: "10px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#8a2a0c", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>
                        <span style={{ flexShrink: "0" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </svg>
                        </span>
                        <span>{v.lossText}</span>
                      </div>
                    </>) : null}
                    <button type="submit" className="btn solid big">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Save and schedule</span>
                    </button>
                    <__Link href="/flash-sales" className="btn line">Cancel</__Link>
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
