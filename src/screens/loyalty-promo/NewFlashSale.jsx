'use client';
// Generated from design/templates/loyalty-promo/NewFlashSale.dc.html by scripts/convert-design.mjs.
// NewFlashSale — start a flash sale (docs/shopify-style.md, form page): RecordHeader with Save, the fields in short
// cards (name, when, products and prices with the product finder folded, limits) and the poster preview on the side.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { FORM_CSS, Steps, Switch } from './loyShared';

// ---- form helpers: required marker, field error text, invalid attributes, focus the first error ----
function __Req() { return <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}> *</span>; }
function __Err({ id, msg }) { return msg ? <span id={id} className="ly-err">{msg}</span> : null; }
function __inv(err, id) { return err ? { 'aria-invalid': 'true', 'aria-describedby': id } : {}; }
function __focusSoon(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
function __without(o, k) { var r = {}; for (var x in (o || {})) if (x !== k) r[x] = o[x]; return r; }

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var P = [
  { id: 1, name: 'Denim Jeans · Blue · 32', code: '8941200200214', mrp: 1890, cost: 1150, price: 1290, qty: 40 },
  { id: 2, name: 'Men’s Polo Shirt · Navy · M', code: '8941200100118', mrp: 1450, cost: 780, price: 990, qty: 60 },
  { id: 3, name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', mrp: 1250, cost: 936, price: 890, qty: 30 },
  { id: 4, name: 'Cotton T-shirt · Black · M', code: '8941200300311', mrp: 590, cost: 290, price: 399, qty: 80 }
];
var EXTRA = { id: 5, name: 'Rice Water Cleanser 150ml', code: '8941100500341', mrp: 890, cost: 426, price: 690, qty: 25 };
var WHENS = [{ k: 'tonight', label: 'Tonight 6:00 PM – 12:00 AM' }, { k: 'weekend', label: 'This weekend' }, { k: 'three', label: '3 days' }, { k: 'own', label: 'Pick dates' }];

// The demo clock is 12:14 PM (Dhaka) on today's date. The first render (server and hydration) uses this fixed
// day; after mount the screen moves to today (clockNow), so the presets and the poster never show stale dates.
var NOW0 = Date.UTC(2026, 8, 18, 6, 14, 0); // 18 Sep 2026, 12:14 PM Dhaka
function demoNow() { var DAY = 86400000, H6 = 6 * 3600000, mid = Math.floor((clockNow() + H6) / DAY) * DAY - H6; return mid + (12 * 60 + 14) * 60000; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function partsOf(ms) { if (ms < 0) ms = 0; var x = Math.floor(ms / 1000); return { d: Math.floor(x / 86400), h: Math.floor(x % 86400 / 3600), m: Math.floor(x % 3600 / 60), s: x % 60 }; }
var WDAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function whenOf(t) { var d = new Date(t + 6 * 3600000), h = d.getUTCHours(), ap = h < 12 ? 'am' : 'pm'; return WDAY[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' + ((h % 12) || 12) + ':' + pad2(d.getUTCMinutes()) + ' ' + ap; }
function txtOf(t) { var d = new Date(t + 6 * 3600000), h = d.getUTCHours(); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ', ' + ((h % 12) || 12) + ':' + pad2(d.getUTCMinutes()) + ' ' + (h < 12 ? 'AM' : 'PM'); }
// preset start / end times from the demo "now": tonight, the coming Friday to Sunday, 3 days from tomorrow, a week from day 4
function timesAt(now) {
  var DAY = 86400000, H = 3600000, mid = now - (now + 6 * H) % DAY, fri = mid + ((5 - new Date(mid + 6 * H).getUTCDay() + 7) % 7) * DAY;
  var at = function (d0, days, h, mi) { return d0 + days * DAY + h * H + (mi || 0) * 60000; };
  return { tonight: [at(mid, 0, 18), at(mid, 0, 23, 59)], weekend: [at(fri, 0, 18), at(fri, 2, 23, 59)], three: [at(mid, 1, 0), at(mid, 3, 23, 59)], own: [at(mid, 4, 0), at(mid, 10, 23, 59)] };
}
var LEADS = [{ k: 'at', label: 'At the start', ms: 0 }, { k: 'h6', label: '6 hours before', ms: 6 * 3600000 }, { k: 'd1', label: '1 day before', ms: 86400000 }, { k: 'd3', label: '3 days before', ms: 3 * 86400000 }];
// catalogue the finder searches · exp = days to expiry, noSale = days since last sale, sold30 = pieces in 30 days, age = days since it arrived, other = in another running sale
var CAT = [
  { id: 101, name: 'Vitamin C Serum 30ml', code: '8941100500419', cat: 'Skin care', brand: 'Kioraa', mrp: 1650, cost: 820, stock: 34, exp: 21, sold30: 9, noSale: 6, age: 210 },
  { id: 102, name: 'Snail Repair Cream 50ml', code: '8941100500426', cat: 'Skin care', brand: 'Kioraa', mrp: 2450, cost: 1300, stock: 18, exp: 38, sold30: 4, noSale: 11, age: 260 },
  { id: 103, name: 'Aloe Soothing Gel 300ml', code: '8941100500433', cat: 'Skin care', brand: 'Kioraa', mrp: 690, cost: 310, stock: 120, exp: 54, sold30: 22, noSale: 1, age: 300 },
  { id: 104, name: 'Mango Juice 1L · 12 pack', code: '8941300100127', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 1440, cost: 1050, stock: 46, exp: 12, sold30: 30, noSale: 2, age: 40 },
  { id: 105, name: 'Basmati Rice 5kg', code: '8941300100134', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 1180, cost: 930, stock: 210, exp: 160, sold30: 64, noSale: 1, age: 90 },
  { id: 106, name: 'Greek Yogurt 500g', code: '8941300100141', cat: 'Grocery', brand: 'Deshi Fresh', mrp: 320, cost: 210, stock: 58, exp: 6, sold30: 41, noSale: 1, age: 5 },
  { id: 107, name: 'Leather Jacket · Black · L', code: '8941200200412', cat: 'Clothing', brand: 'Aarong Basics', mrp: 7800, cost: 4300, stock: 9, exp: null, sold30: 1, noSale: 48, age: 320 },
  { id: 108, name: 'Silk Saree · Maroon', code: '8941200200429', cat: 'Clothing', brand: 'Aarong Basics', mrp: 5400, cost: 2600, stock: 14, exp: null, sold30: 3, noSale: 19, age: 150 },
  { id: 109, name: 'Winter Hoodie · Grey · M', code: '8941200200436', cat: 'Clothing', brand: 'Aarong Basics', mrp: 1950, cost: 900, stock: 140, exp: null, sold30: 5, noSale: 63, age: 280 },
  { id: 110, name: 'Kids Raincoat · Yellow', code: '8941200200443', cat: 'Clothing', brand: 'Aarong Basics', mrp: 890, cost: 380, stock: 95, exp: null, sold30: 2, noSale: 71, age: 400 },
  { id: 111, name: 'Bluetooth Earbuds Pro', code: '8941400100118', cat: 'Electronics', brand: 'SoundBD', mrp: 3490, cost: 2100, stock: 26, exp: null, sold30: 18, noSale: 1, age: 14 },
  { id: 112, name: 'Smart Watch S2', code: '8941400100125', cat: 'Electronics', brand: 'SoundBD', mrp: 6200, cost: 4100, stock: 12, exp: null, sold30: 6, noSale: 4, age: 22 },
  { id: 113, name: 'Power Bank 20000mAh', code: '8941400100132', cat: 'Electronics', brand: 'SoundBD', mrp: 2250, cost: 1380, stock: 80, exp: null, sold30: 55, noSale: 1, age: 180 },
  { id: 114, name: 'Linen Kurta · White · L', code: '8941200200450', cat: 'Clothing', brand: 'Aarong Basics', mrp: 2100, cost: 820, stock: 60, exp: null, sold30: 38, noSale: 1, age: 8 },
  { id: 115, name: 'Cotton T-shirt · Black · M', code: '8941200300311', cat: 'Clothing', brand: 'Aarong Basics', mrp: 590, cost: 290, stock: 80, exp: null, sold30: 120, noSale: 1, age: 200, other: 'Weekend Mega Sale' }
];
var CRITS = [
  { k: 'expiring', label: 'Expiring soon', note: 'Within 60 days', test: function (p) { return p.exp != null && p.exp <= 60; }, sort: function (a, b) { return a.exp - b.exp; } },
  { k: 'value', label: 'High value', note: '৳2,500 and up', test: function (p) { return p.mrp >= 2500; }, sort: function (a, b) { return b.mrp * b.stock - a.mrp * a.stock; } },
  { k: 'slow', label: 'Slow moving', note: 'No sale 45+ days', test: function (p) { return p.noSale >= 45; }, sort: function (a, b) { return b.noSale - a.noSale; } },
  { k: 'over', label: 'Overstock', note: '90+ days of stock', test: function (p) { return cover(p) >= 90; }, sort: function (a, b) { return cover(b) - cover(a); } },
  { k: 'best', label: 'Best sellers', note: 'Pull people in', test: function (p) { return p.sold30 >= 30; }, sort: function (a, b) { return b.sold30 - a.sold30; } },
  { k: 'margin', label: 'Big margin', note: '45%+ margin', test: function (p) { return marginOf(p) >= 45; }, sort: function (a, b) { return marginOf(b) - marginOf(a); } },
  { k: 'new', label: 'New arrivals', note: 'Last 30 days', test: function (p) { return p.age <= 30; }, sort: function (a, b) { return a.age - b.age; } },
  { k: 'all', label: 'All products', note: 'Everything', test: function () { return true; }, sort: function (a, b) { return a.name < b.name ? -1 : 1; } }
];
function cover(p) { return p.sold30 ? Math.round(p.stock / (p.sold30 / 30)) : 999; }
function marginOf(p) { return Math.round((p.mrp - p.cost) / p.mrp * 100); }
function suggestPct(p, k) {
  if (k === 'expiring') return p.exp <= 10 ? 40 : p.exp <= 30 ? 30 : 20;
  if (k === 'slow') return p.noSale >= 60 ? 35 : 25;
  if (k === 'over') return 25; if (k === 'margin') return 25; if (k === 'value') return 15; if (k === 'best' || k === 'new') return 10; return 20;
}
function whyOf(p, k, now0) {
  var ed = new Date((now0 || NOW0) + 6 * 3600000 + (p.exp || 0) * 86400000);
  var map = {
    expiring: [p.exp != null ? 'Expires in ' + p.exp + ' days' : 'No expiry', p.exp != null ? 'Best before ' + ed.getUTCDate() + ' ' + MONTHS[ed.getUTCMonth()] + ' ' + ed.getUTCFullYear() : '', p.exp != null && p.exp <= 14 ? ['var(--fill-error-soft)', 'var(--text-danger)'] : ['var(--fill-warning-soft)', 'var(--text-warning)']],
    value: ['৳' + p.mrp.toLocaleString('en-IN') + ' each', 'Stock worth ' + bdt(p.mrp * p.stock), ['var(--fill-primary-soft)', 'var(--primary)']],
    slow: ['No sale in ' + p.noSale + ' days', p.sold30 + ' sold in 30 days', ['var(--fill-warning-soft)', 'var(--text-warning)']],
    over: [cover(p) >= 999 ? 'Not selling' : 'Stock for ' + cover(p) + ' days', p.stock + ' in stock · ' + p.sold30 + ' sold a month', ['var(--fill-info-soft)', 'var(--text-info)']],
    best: ['Sold ' + p.sold30 + ' in 30 days', 'Pulls customers to the sale', ['var(--fill-success-soft)', 'var(--text-success)']],
    margin: ['Margin ' + marginOf(p) + '%', 'Room to cut the price', ['var(--fill-info-soft)', 'var(--text-info)']],
    'new': ['Arrived ' + p.age + ' days ago', 'Launch price for new stock', ['var(--fill-info-soft)', 'var(--text-info)']],
    all: [p.cat, p.brand, ['var(--surface-subtle)', 'var(--text-body)']]
  };
  return map[k];
}
class Component extends DCLogic {
  componentDidMount() { var self = this; this.setState({ now0: demoNow() }); this.iv = setInterval(function () { self.setState({ tick: ((self.state && self.state.tick) || 0) + 1 }); }, 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  renderVals() {
    var self = this, s = this.state || {};
    var list = s.list || P.map(function (p) { return assign({}, p); });
    var upd = function (id, f) { self.setState({ list: list.map(function (p) { return p.id === id ? f(assign({}, p)) : p; }) }); };
    var now0 = s.now0 || NOW0, TIMES = timesAt(now0);
    var wk = s.when || 'weekend', W = { s: txtOf(TIMES[wk][0]), e: txtOf(TIMES[wk][1]) };
    var errs = s.errs || {};
    var title = s.title != null ? s.title : 'Weekend Mega Sale';
    // Start and end follow the chosen preset until the user types their own.
    var startTxt = s.startTxt != null ? s.startTxt : W.s, endTxt = s.endTxt != null ? s.endTxt : W.e;
    var tot = 0, losses = [];
    var items = list.map(function (p) {
      var pr = p.price - p.cost; tot += pr * p.qty; if (pr < 0) losses.push(p.name);
      return { name: p.name, code: p.code, initial: p.name.charAt(0), mrp: bdt(p.mrp), price: bdt(p.price), off: Math.round((1 - p.price / p.mrp) * 100) + '% off', qty: p.qty,
        profit: bdt(pr), pNote: pr < 0 ? 'Loss! Bought at ' + bdt(p.cost) : 'Bought at ' + bdt(p.cost), loss: pr < 0, cls: p.fresh ? 'nf-fresh' : '',
        dn: function () { upd(p.id, function (x) { x.price = Math.max(10, x.price - 10); return x; }); }, up: function () { upd(p.id, function (x) { x.price = Math.min(x.mrp, x.price + 10); return x; }); },
        qdn: function () { upd(p.id, function (x) { x.qty = Math.max(1, x.qty - 5); return x; }); }, qup: function () { upd(p.id, function (x) { x.qty += 5; return x; }); },
        remove: function () { self.setState({ list: list.filter(function (x) { return x.id !== p.id; }) }); } };
    });
    var setPct = function (n) { return function () { self.setState({ list: list.map(function (p) { var x = assign({}, p); x.price = Math.round(x.mrp * (1 - n / 100) / 10) * 10; return x; }) }); }; };

    // ---- poster preview: counts down to the start, then shows when it ends
    var now = now0 + (s.tick || 0) * 1000, TW = TIMES[wk], pvk = s.pv || 'before', before = pvk === 'before';
    var cp = partsOf(before ? TW[0] - now : TW[1] - TW[0]), fg = 'var(--error)';
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
      pvTabs: [{ k: 'before', label: 'Before it starts' }, { k: 'live', label: 'Once it starts' }].map(function (t) { var on = t.k === pvk; return { label: t.label, on: on, pick: function () { self.setState({ pv: t.k }); } }; }),
      pvNow: before ? 'Now: ' + whenOf(now).split(', ')[1] + ', ' + whenOf(now).split(', ')[0] : 'At ' + whenOf(TW[0]),
      pvCover: before ? 'linear-gradient(135deg, var(--primary-900), var(--primary-600))' : 'linear-gradient(135deg, var(--error), var(--warning))', pvFg: before ? 'var(--primary)' : fg,
      pvPill: before ? 'COMING SOON' : 'LIVE NOW', pvIsLive: !before, pvShowRemind: before && rmd.on,
      pvWhen: before ? 'Starts ' + whenOf(TW[0]) : 'Ends ' + whenOf(TW[1]),
      pvClockLabel: before ? 'STARTS IN' : 'ENDS IN',
      pvHelp: before ? (soonP.on ? 'Goes up on the Offers page ' + (L.ms ? whenOf(TW[0] - L.ms) : 'at the start time') + '. At ' + whenOf(TW[0]).split(', ')[1] + ' the countdown switches to the end time by itself.' : 'The “Coming soon” poster is off. The sale appears on the Offers page at the start time.') : 'From the start time the poster counts down to ' + whenOf(TW[1]) + ', then moves to “Ended” by itself and prices go back to normal.',
      previews: list.slice(0, 2).map(function (p) { var hide = before && !sp.on; return { initial: p.name.charAt(0), name: p.name, price: hide ? bdt(p.mrp) : bdt(p.price), mrp: hide ? '' : bdt(p.mrp), off: '−' + Math.round((1 - p.price / p.mrp) * 100) + '%', tagBg: before ? 'var(--slate-700)' : fg, priceFg: before ? 'var(--text-heading)' : fg, locked: before, lockText: hide ? 'Price drops at the start' : 'Sale price from ' + whenOf(TW[0]).split(', ')[0].replace(/^\w+ /, '') }; }),
      soonPoster: soonP, remind: rmd, showPrices: sp,
      leads: mkChips(this, LEADS, lk, 'lead'),
      leadText: L.ms ? 'Poster goes up ' + whenOf(TW[0] - L.ms) + ' and counts down to ' + whenOf(TW[0]) + '.' : 'Poster goes up at ' + whenOf(TW[0]) + ' and shows only the end time.',
      finderOpen: !!s.finder, finderBtn: s.finder ? 'Hide' : 'Find products', finderToggle: function () { self.setState({ finder: !s.finder }); },
      crits: CRITS.map(function (c) { var on = c.k === crit, n = base.filter(c.test).length; return { label: c.label, note: c.note, count: n, on: on, pick: function () { self.setState({ crit: c.k, sel: {} }); } }; }),
      cats: ['All', 'Skin care', 'Clothing', 'Grocery', 'Electronics'].map(function (c) { var on = c === cat; return { label: c === 'All' ? 'All categories' : c, on: on, pick: function () { self.setState({ cat: c, sel: {} }); } }; }),
      hideOther: hideO, critHint: cands.length + ' match · sorted by ' + { expiring: 'soonest expiry', value: 'stock value', slow: 'longest without a sale', over: 'most days of stock', best: 'most sold', margin: 'biggest margin', 'new': 'newest', all: 'name' }[crit],
      cands: cands.map(function (p) { var w = whyOf(p, crit, now0), g = sugOf(p), had = !!inSale[p.code], on = !!sel[p.id] || had, pr = g.pr - p.cost;
        return { name: p.name, meta: p.cat + ' · ' + p.stock + ' in stock' + (p.other ? ' · in ' + p.other : ''), why: w[0], whySub: had ? 'Already in this sale' : w[1], whyBg: w[2][0], whyFg: w[2][1],
          stock: p.stock, mrp: bdt(p.mrp), sug: bdt(g.pr), sugOff: '−' + g.pc + '%', sugNote: g.capped ? 'Kept above buying price' : 'Bought at ' + bdt(p.cost), profit: bdt(pr), loss: pr < 0,
          on: on, inSale: had,
          toggle: function () { if (had) return; var x = assign({}, sel); x[p.id] = !sel[p.id]; self.setState({ sel: x }); } }; }),
      noCands: cands.length === 0,
      allOn: allOn,
      toggleAll: function () { var x = {}; if (!allOn) selectable.forEach(function (p) { x[p.id] = true; }); self.setState({ sel: x }); },
      selText: pick.length ? pick.length + ' selected · if all sell, profit ' + bdt(pick.reduce(function (a, p) { return a + (sugOf(p).pr - p.cost) * Math.min(p.stock, 20); }, 0)) : 'Tick products to add them with the suggested price. You can change each price below.',
      noSel: !pick.length, addText: pick.length ? 'Add ' + pick.length + ' to this sale' : 'Add to this sale',
      addSel: function () { if (pick.length) add(pick); }, clearSel: function () { self.setState({ sel: {} }); },
      pcts: [10, 20, 30, 40].map(function (n) { return { label: n + '%', on: false, pick: setPct(n) }; }),
      items: items,
      addOne: function () { if (list.some(function (p) { return p.id === 5; })) return; var e = assign({}, EXTRA); e.fresh = true; self.setState({ list: list.concat([e]) }); },
      nItems: list.length, nPieces: list.reduce(function (a, p) { return a + p.qty; }, 0), totProfit: bdt(tot), totLoss: tot < 0,
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

// ---- styles ----

const CSS = `
.nf-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.nf-name{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:var(--space-3);align-items:start}
.nf-upload{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:96px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.nf-upload b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.nf-scan{display:flex;gap:var(--space-2)}
.nf-scan .ix-search{height:var(--control-height)}
.nf-finder{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.nf-fhead{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);background:var(--surface-subtle)}
.nf-fhead b{flex:1;min-width:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.nf-fbody{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3)}
.nf-crits{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.nf-crit{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.nf-crit[aria-checked="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.nf-crit b{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.nf-crit b span{margin-left:4px;font-weight:var(--weight-regular);color:var(--text-muted)}
.nf-crit small{max-width:100%;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.nf-filters{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.nf-hide{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--text-xs-plus);color:var(--text-body)}
.nf-hide>span:last-child{margin-left:auto;color:var(--text-muted)}
.nf-box{border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.nf-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.nf-why{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.nf-selbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.nf-selbar>span{flex:1 1 220px;min-width:0;font-size:var(--text-xs-plus);color:var(--text-body)}
.nf-items{min-width:760px}
.nf-items td:first-child{min-width:180px}
.nf-was{color:var(--text-muted);text-decoration:line-through}
.nf-fresh td{animation:nfFresh 900ms ease-out}
@keyframes nfFresh{from{background:var(--fill-success-soft)}to{background:transparent}}
.nf-poster{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.nf-cover{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);color:var(--text-on-dark)}
.nf-pills{display:flex;align-items:center;gap:6px}
.nf-pill{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:var(--radius-full);background:rgba(255,255,255,.2);font-size:var(--text-2xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label)}
.nf-pill--solid{background:var(--surface-card)}
.nf-cover b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.nf-cover small{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.nf-clock{display:flex;gap:6px}
.nf-clock>div{min-width:44px;padding:4px;border-radius:var(--radius-md);background:rgba(15,23,42,.35);text-align:center;font-size:var(--text-2xs)}
.nf-clock b{display:block;font-family:var(--font-data);font-size:var(--text-sm-plus)}
.nf-cta{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.nf-prev{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-2);padding:var(--space-3);background:var(--surface-card)}
.nf-prev__pic{position:relative;display:grid;place-items:center;height:72px;border-radius:var(--radius-md);background:var(--slate-150);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--primary)}
.nf-prev__pic span{position:absolute;top:4px;left:4px;padding:0 6px;border-radius:var(--radius-md);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-on-dark)}
.nf-prev__name{margin-top:4px;overflow:hidden;font-size:var(--text-xs);text-overflow:ellipsis;white-space:nowrap}
.nf-prev__price{font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.nf-prev__lock{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-body)}
.nf-loss{display:flex;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-xs);line-height:1.5;color:var(--text-danger)}
.nf-loss svg{flex:none;margin-top:1px}
.nf-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:767px){.nf-name{grid-template-columns:minmax(0,1fr)}.nf-crits{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.nf-scan{flex-direction:column}.nf-scan .ix-search{flex:none}.nf-hide>span:last-child{margin-left:0;flex:1 1 100%}}
`;

// ---- markup ----

const swRow = (sw, title, tip) => (
  <div className="ly-set"><div><b>{title}{tip ? <InfoTip text={tip} /> : null}</b></div><Switch on={sw?.on} onToggle={sw?.toggle} label={title} /></div>
);

export default class NewFlashSaleScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewFlashSale">
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="promo-flash" />
          <main className="gc-shell__main">
            <__Topbar crumb="Promo / Flash sales" page="Start a flash sale" placeholder="Search a sale" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/flash-sales" backLabel="Flash sales" title="Start a flash sale" primary={{ label: 'Save and schedule', onClick: v.submit }} />
                <form noValidate onSubmit={v.submit} aria-label="New flash sale" className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card nf-card" aria-labelledby="nf-s1">
                      <header className="ix-card__head"><h2 id="nf-s1">Name and picture <InfoTip text="Shown on top of the sale page." /></h2></header>
                      <div className="ix-card__body">
                        <div className="nf-name">
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="fs-title">Sale name<__Req /></label>
                            <input id="fs-title" className="gc-input" value={v.title} onChange={v.typeTitle} aria-required="true" {...__inv(v.errs?.title, "fs-title-err")} />
                            <__Err id="fs-title-err" msg={v.errs?.title} />
                            {swRow(v.feat, 'Show on home page', 'A big banner with the countdown')}
                          </div>
                          <button type="button" className="nf-upload"><__Icon name="image-up" width="20" height="20" aria-hidden="true" /><b>Add banner picture</b><span>1200 × 400, JPG or PNG</span></button>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card nf-card" aria-labelledby="nf-s2">
                      <header className="ix-card__head"><h2 id="nf-s2">When does it run? <InfoTip text="The price goes back to normal by itself when time is up." /></h2></header>
                      <div className="ix-card__body">
                        <div className="ix-chips" role="group" aria-label="When does it run?">
                          {v.whens.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.label}</button>)}
                        </div>
                        <div className="ly-two">
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="fs-start">Starts<__Req /></label>
                            <input id="fs-start" className="gc-input" value={v.startTxt} onChange={v.typeStart} aria-required="true" {...__inv(v.errs?.start, "fs-start-err")} />
                            <__Err id="fs-start-err" msg={v.errs?.start} />
                          </div>
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="fs-end">Ends<__Req /></label>
                            <input id="fs-end" className="gc-input" value={v.endTxt} onChange={v.typeEnd} aria-required="true" {...__inv(v.errs?.end, "fs-end-err")} />
                            <__Err id="fs-end-err" msg={v.errs?.end} />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card nf-card" aria-labelledby="nf-s3">
                      <header className="ix-card__head"><h2 id="nf-s3">Which products, and at what price? <InfoTip text="Profit is checked with your buying price, so you never sell at a loss by mistake." /></h2></header>
                      <div className="ix-card__body">
                        <div className="nf-scan">
                          <label className="ix-search">
                            <__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
                            <input id="fs-scan" type="search" placeholder="Scan barcode or type product name" aria-label="Scan barcode or type product name" {...__inv(v.itemsErr, "fs-items-err")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); v.addOne(); } }} />
                          </label>
                          <button type="button" className="ix-btn" onClick={v.addOne}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add product</button>
                        </div>

                        <div className="nf-finder">
                          <div className="nf-fhead">
                            <__Icon name="sparkles" width="16" height="16" aria-hidden="true" />
                            <b>Find products to put on sale <InfoTip text="Pick a reason, narrow it down, tick what you want. Each product comes in with a suggested sale price that never goes below your buying price." /></b>
                            <button type="button" className="ix-btn ix-btn--sm" onClick={v.finderToggle} aria-expanded={v.finderOpen}>{v.finderBtn}</button>
                          </div>
                          {v.finderOpen ? (
                            <div className="nf-fbody">
                              <div role="radiogroup" aria-label="Why put it on sale" className="nf-crits">
                                {v.crits.map((c) => (
                                  <button key={c.label} type="button" role="radio" aria-checked={c.on} className="nf-crit" onClick={c.pick}><b>{c.label}<span>{c.count}</span></b><small>{c.note}</small></button>
                                ))}
                              </div>
                              <div className="ix-chips" role="group" aria-label="Category">
                                {v.cats.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.label}</button>)}
                              </div>
                              <div className="nf-filters">
                                <select className="ix-filter" aria-label="Brand"><option>All brands</option><option>Kioraa</option><option>Aarong Basics</option><option>Deshi Fresh</option><option>SoundBD</option></select>
                                <select className="ix-filter" aria-label="Stock at least"><option>5 pieces</option><option>1 piece</option><option>20 pieces</option><option>50 pieces</option></select>
                                <select className="ix-filter" aria-label="Price"><option>Any price</option><option>Under ৳500</option><option>৳500 – ৳2,000</option><option>Over ৳2,000</option></select>
                                <select className="ix-filter" aria-label="Warehouse"><option>All warehouses</option><option>Dhanmondi branch</option><option>Mirpur godown</option></select>
                              </div>
                              <div className="nf-hide">
                                <Switch on={v.hideOther?.on} onToggle={v.hideOther?.toggle} label="Hide products already in another sale" />
                                <span>Hide products already in another running sale</span>
                                <span>{v.critHint}</span>
                              </div>
                              <div className="ix-table-wrap ix-table-wrap--show nf-box" role="group" aria-label="Matching products">
                                <table className="ix-table ix-table--static gc-table--keep">
                                  <thead><tr><th scope="col" className="ix-check"><input type="checkbox" checked={v.allOn} onChange={v.toggleAll} aria-label="Select all shown" /></th><th scope="col">Product</th><th scope="col">Why it fits</th><th scope="col" className="ix-num">Suggested price</th></tr></thead>
                                  <tbody>
                                    {v.cands.map((r) => (
                                      <tr key={r.name} style={r.inSale ? { opacity: 0.6 } : undefined}>
                                        <td className="ix-check"><input type="checkbox" checked={r.on} disabled={r.inSale} onChange={r.toggle} aria-label={`Select ${r.name}`} /></td>
                                        <td><span className="ix-strong">{r.name}</span><span className="nf-sub">{r.meta}</span></td>
                                        <td><span className="nf-why" style={{ background: r.whyBg, color: r.whyFg }}>{r.why}</span><span className="nf-sub">{r.whySub}</span></td>
                                        <td className="ix-num"><span className="ix-strong">{r.sug}</span> <span className="ix-bad">{r.sugOff}</span><span className="nf-sub">was {r.mrp} · <span className={r.loss ? 'ix-bad' : 'ly-in'}>+{r.profit}</span></span><span className="nf-sub">{r.sugNote}</span></td>
                                      </tr>
                                    ))}
                                    {v.noCands ? <tr><td colSpan={4} className="ix-muted">Nothing matches. Try another category or turn off “Hide products already in another running sale”.</td></tr> : null}
                                  </tbody>
                                </table>
                              </div>
                              <div className="nf-selbar">
                                <span>{v.selText}</span>
                                <button type="button" className="ix-btn ix-btn--sm" onClick={v.clearSel}>Clear</button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={v.addSel} aria-disabled={v.noSel}><__Icon name="plus" width="16" height="16" aria-hidden="true" />{v.addText}</button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="ly-row">
                          <span>Same discount for all:</span>
                          {v.pcts.map((c) => <button key={c.label} type="button" className="ix-chip" onClick={c.pick}>{c.label}</button>)}
                        </div>
                        <div className="ix-table-wrap ix-table-wrap--show nf-box" role="region" aria-label="Products in this sale" tabIndex="0">
                          <table className="ix-table ix-table--static gc-table--keep nf-items">
                            <thead>
                              <tr>
                                <th scope="col">Product</th>
                                <th scope="col" className="ix-num">Normal price</th>
                                <th scope="col">Sale price</th>
                                <th scope="col" className="ix-num">Profit per piece</th>
                                <th scope="col">Pieces for sale</th>
                                <th scope="col"><span className="sr-only">Remove</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {v.items.map((r) => (
                                <tr key={r.code + r.name} className={r.cls}>
                                  <td><span className="ix-strong">{r.name}</span><span className="nf-sub ly-fig">{r.code}</span></td>
                                  <td className="ix-num nf-was">{r.mrp}</td>
                                  <td className="ix-nowrap"><Steps label={`sale price for ${r.name}`} less={`Less sale price for ${r.name}`} more={`More sale price for ${r.name}`} display={r.price} onDec={r.dn} onInc={r.up} /> <span className="ix-bad">{r.off}</span></td>
                                  <td className="ix-num"><span className={'ix-strong ' + (r.loss ? 'ix-bad' : 'ly-in')}>{r.profit}</span><span className={'nf-sub' + (r.loss ? ' ix-bad' : '')}>{r.pNote}</span></td>
                                  <td className="ix-nowrap"><Steps label={`pieces of ${r.name}`} less={`Fewer pieces of ${r.name}`} more={`More pieces of ${r.name}`} display={r.qty} onDec={r.qdn} onInc={r.qup} /></td>
                                  <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${r.name}`} onClick={r.remove}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <__Err id="fs-items-err" msg={v.itemsErr} />
                      </div>
                    </section>

                    <section className="ix-card nf-card" aria-labelledby="nf-s4">
                      <header className="ix-card__head"><h2 id="nf-s4">Limits and showing</h2></header>
                      <div className="ix-card__body">
                        <div>
                          {swRow(v.onPage, 'Show on the Offers & Promotions page', 'Customers see it with a countdown. It moves to “Ended” by itself.')}
                          {swRow(v.soonPoster, 'Show a “Coming soon” poster before it starts', 'The poster counts down to the start time, then switches by itself to show when the sale ends.')}
                          {v.soonPoster?.on ? (
                            <div className="ly-set">
                              <div>
                                <b>Put the poster up</b>
                                <div className="ix-chips" style={{ marginTop: 'var(--space-2)' }}>{v.leads.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.label}</button>)}</div>
                                <small style={{ marginTop: 'var(--space-1)' }}>{v.leadText}</small>
                              </div>
                            </div>
                          ) : null}
                          {swRow(v.remind, 'Let customers ask for a reminder', 'A “Remind me” button on the poster. We send one SMS when the sale opens.')}
                          {swRow(v.showPrices, 'Show sale prices before it starts', 'Off: the poster shows only the discount, and prices appear at the start time.')}
                          {swRow(v.lim1, 'Max 2 pieces per customer', 'So more customers get the offer')}
                          {swRow(v.stack, 'Coupons also work', 'Customers can add a code on top of the sale price')}
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="ix-side nf-side">
                    <section className="ix-card" aria-labelledby="nf-poster">
                      <header className="ix-card__head"><h2 id="nf-poster">Poster on the Offers page</h2><span className="ly-help">{v.pvNow}</span></header>
                      <div className="ix-card__body">
                        <div className="gc-seg" role="tablist" aria-label="Poster state">
                          {v.pvTabs.map((t) => <button key={t.label} type="button" role="tab" aria-selected={t.on} className={'gc-seg__btn' + (t.on ? ' gc-seg__btn--active' : '')} onClick={t.pick}>{t.label}</button>)}
                        </div>
                        <div className="nf-poster">
                          <div className="nf-cover" style={{ background: v.pvCover }}>
                            <span className="nf-pills"><span className="nf-pill"><__Icon name="zap" width="12" height="12" aria-hidden="true" />FLASH SALE</span><span className="nf-pill nf-pill--solid" style={{ color: v.pvFg }}>{v.pvPill}</span></span>
                            <b>{v.title}</b>
                            <small><__Icon name="calendar" width="14" height="14" aria-hidden="true" />{v.pvWhen}</small>
                            <small>{v.pvClockLabel}</small>
                            <div className="nf-clock" role="timer">{v.clock.map((k) => <div key={k.l}><b>{k.v}</b>{k.l}</div>)}</div>
                            {v.pvShowRemind ? <span className="nf-cta" style={{ color: v.pvFg }}><__Icon name="bell" width="14" height="14" aria-hidden="true" />Remind me when it starts</span> : null}
                            {v.pvIsLive ? <span className="nf-cta" style={{ color: v.pvFg }}>Shop the sale →</span> : null}
                          </div>
                          <div className="nf-prev">
                            {v.previews.map((p) => (
                              <div key={p.name}>
                                <div className="nf-prev__pic">{p.initial}<span style={{ background: p.tagBg }}>{p.off}</span></div>
                                <div className="nf-prev__name">{p.name}</div>
                                <div className="nf-prev__price" style={{ color: p.priceFg }}>{p.price} <span className="nf-was ly-help" style={{ display: 'inline' }}>{p.mrp}</span></div>
                                {p.locked ? <span className="nf-prev__lock"><__Icon name="lock" width="12" height="12" aria-hidden="true" />{p.lockText}</span> : null}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="ly-help">{v.pvHelp}</p>
                        <dl className="ix-sum"><dt>Products</dt><dd>{v.nItems}</dd><dt>Pieces for sale</dt><dd>{v.nPieces}</dd><dt className="is-total">If all are sold, profit</dt><dd className={'is-total ' + (v.totLoss ? 'ix-bad' : 'ly-in')}>{v.totProfit}</dd></dl>
                        {v.hasLoss ? <div className="nf-loss" role="alert"><__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{v.lossText}</span></div> : null}
                        <button type="submit" className="ix-btn ix-btn--primary">Save and schedule</button>
                      </div>
                    </section>
                  </aside>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
