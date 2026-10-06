'use client';
// Generated from design/templates/loyalty-promo/NewCoupon.dc.html by scripts/convert-design.mjs.
// NewCoupon — make a new discount code (docs/shopify-style.md, form page): RecordHeader with Save, the fields in
// short cards (discount, code, who, payment, where, when, offer post) and what the customer will see on the side.
// Offer Builder (Nayeem's brief #9): one form for every offer the promotion engine knows (src/lib/promotions.js) —
// a code customers type or an automatic offer (no code); taka / % off, free delivery, Buy X get Y, quantity
// discounts and free gifts; who, products, payment, where and when; which other offers it may combine with (instead
// of one "join other offers" switch); "Test this offer" runs the engine on a sample cart. Save stores the offer in the
// engine, so the POS register, Create order and the checkout apply it at once. ?type=auto opens an automatic offer.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { FORM_CSS, Steps, Switch } from './loyShared';
import { saveOffer, evaluate, overlaps, getOffers as getOffersNow, CLASSES as PROMO_CLASSES } from '@/lib/promotions';
import { CATALOG } from '@/lib/stock';
import { navigate } from '@/runtime/routes';

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
var KINDS = [{ k: 'tk', label: 'Taka off' }, { k: 'pct', label: '% off' }, { k: 'ship', label: 'Free delivery' }, { k: 'bxgy', label: 'Buy X get Y' }, { k: 'tiered', label: 'Quantity discount' }, { k: 'gift', label: 'Free gift' }];
var ACTS = [{ k: 'code', label: 'Customer types a code' }, { k: 'auto', label: 'Automatic, no code' }];
var COMBINE = ['product', 'order', 'delivery', 'flash', 'points'];
var CATS = CATALOG.reduce(function (a, p) { if (a.indexOf(p.cat) < 0) a.push(p.cat); return a; }, []);
var PRODUCTS = CATALOG.map(function (p) { return { sku: p.sku, name: p.name, price: p.price, cat: p.cat }; });
var PAY_TEST = [['cod', 'Cash on delivery'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['cash', 'Cash at the counter']];
var dayMs = function (iso, end) { if (!iso) return null; var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], end ? 23 : 0, end ? 59 : 0).getTime(); };
var WHOS = [{ k: 'all', label: 'Everyone' }, { k: 'first', label: 'First order only' }, { k: 'gold', label: 'Gold and Platinum members' }, { k: 'one', label: 'One customer (by phone)' }];
var PRODS = [{ k: 'all', label: 'All products' }, { k: 'cat', label: 'One category' }, { k: 'some', label: 'Some products' }];
var WHERES = [{ k: 'both', label: 'Website and POS counter' }, { k: 'web', label: 'Website only' }, { k: 'pos', label: 'POS counter only' }];
var WORDS = ['HAPPY', 'SAVE', 'DEAL', 'SHUBHO', 'BONUS'];
function assign2(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
// the other offers in the engine (for "Test this offer": how this one combines with them)
function otherOffers() { try { return getOffersNow(); } catch (e) { return []; } }
class Component extends DCLogic {
  componentDidMount() { this.setState(new URLSearchParams(window.location.search).get('type') === 'auto' ? { act: 'auto', mounted: true } : { mounted: true }); }
  renderVals() {
    var self = this, s = this.state || {};
    var idea = s.idea || 'eid', I = IDEAS.filter(function (x) { return x.k === idea; })[0] || IDEAS[2];
    var kind = s.kind || I.kind;
    var errs = s.errs || {};
    var act = s.act || 'code';
    var bx = s.bx || { buySku: 'AC-CHG-20', buyQty: 2, getSku: 'AU-EAR-TC', getQty: 1, getPct: 50 };
    var brackets = s.brackets || [{ min: 3, pct: 5 }, { min: 6, pct: 10 }];
    var giftSku = s.giftSku || 'AC-STD-FLD', cat = s.cat || CATS[0], skus = s.skus || ['PH-RLM-N50'];
    var combine = s.combine || ['product', 'delivery', 'points'];
    var test = s.test || { sku: 'AC-CHG-20', qty: 2, sku2: 'AU-EAR-TC', qty2: 1, pay: 'cod', ch: 'online' };
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
    else if (kind === 'bxgy') { off = 0; big = 'BUY ' + bx.buyQty + ' GET ' + bx.getQty + (bx.getPct >= 100 ? ' FREE' : ' ' + bx.getPct + '% OFF'); }
    else if (kind === 'tiered') { off = 0; big = 'UP TO ' + Math.max.apply(null, brackets.map(function (b) { return b.pct; })) + '% OFF'; }
    else if (kind === 'gift') { off = 0; big = 'FREE GIFT'; }
    else { off = 80; big = 'FREE DELIVERY'; }
    rule = kind === 'tiered' ? brackets.map(function (b) { return b.min + '+ pieces ' + b.pct + '% off'; }).join(' · ') : (minb.v ? 'On bills of ' + bdt(minb.v) + ' or more' : 'On any bill') + (kind === 'pct' ? ' · up to ' + bdt(cap.v) : '');
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
    // the offer as the promotion engine stores it (also what "Test this offer" runs)
    var whoK = s.who || I.who, prodK = s.prod || 'all', whereK = s.where || 'both';
    var draft = function () {
      var type = { tk: 'amount', pct: 'percent', ship: 'free-delivery', bxgy: 'bxgy', tiered: 'tiered', gift: 'gift' }[kind];
      var reward = kind === 'tk' ? { value: +amtV || 0 } : kind === 'pct' ? { value: +amtV || 0, cap: cap.v } : kind === 'bxgy' ? { buy: { skus: [bx.buySku], qty: bx.buyQty }, get: { skus: [bx.getSku], qty: bx.getQty, pct: bx.getPct } }
        : kind === 'tiered' ? { brackets: brackets.filter(function (b) { return b.min > 0 && b.pct > 0; }) } : kind === 'gift' ? { gift: { sku: giftSku, name: (PRODUCTS.find(function (p) { return p.sku === giftSku; }) || {}).name, qty: 1, value: (PRODUCTS.find(function (p) { return p.sku === giftSku; }) || {}).price || 0 } } : {};
      var products = prodK === 'cat' ? { mode: 'cats', cats: [cat] } : prodK === 'some' ? { mode: 'skus', skus: skus } : { mode: 'all' };
      var payment = pmode === 'online' ? { mode: 'online', methods: Object.keys(pm).filter(function (k) { return pm[k]; }) } : pmode === 'split' ? { mode: 'split', split: (function () { var o = {}; PM.forEach(function (m) { if (splitOn[m.k]) o[m.k] = split[m.k]; }); return o; })() } : pmode === 'cod' ? { mode: 'cod' } : { mode: 'any' };
      var cls = kind === 'ship' ? 'delivery' : (kind === 'bxgy' || kind === 'tiered' || kind === 'gift' || prodK !== 'all') ? 'product' : 'order';
      return {
        name: act === 'auto' ? String(s.oname || '').trim() : code + ' — ' + (kind === 'ship' ? 'free delivery' : big.toLowerCase()), code: act === 'code' ? code : '', activation: act === 'code' ? 'code' : (pmode === 'online' || pmode === 'split' ? 'payment' : 'auto'),
        type: type, reward: reward, channels: whereK === 'web' ? ['online'] : whereK === 'pos' ? ['pos'] : ['online', 'pos'],
        conditions: { minSpend: minb.v, products: products, customer: whoK === 'gold' ? 'tiers' : whoK, tiers: whoK === 'gold' ? ['gold', 'plat'] : [], customerKey: whoK === 'one' ? 'P:' + String(s.onePhone || '').replace(/\D/g, '').replace(/^88/, '') : '', payment: payment, minQty: kind === 'gift' && prodK === 'some' ? 1 : 0 },
        schedule: { start: dayMs(dStart), end: dayMs(dEnd, true), days: null, hours: null },
        limits: { total: lim.v, perCustomer: (s.once == null ? true : s.once) ? 1 : 0, perOrder: kind === 'bxgy' ? 2 : 0 },
        stacking: { class: cls, with: combine.filter(function (c) { return c !== cls || cls === 'product'; }), priority: 10 },
      };
    };
    var testCart = { lines: [{ sku: test.sku, qty: test.qty, price: (PRODUCTS.find(function (p) { return p.sku === test.sku; }) || {}).price || 0 }, { sku: test.sku2, qty: test.qty2, price: (PRODUCTS.find(function (p) { return p.sku === test.sku2; }) || {}).price || 0 }].filter(function (l) { return l.qty > 0; }), delivery: test.ch === 'online' ? 80 : 0, payment: test.pay, codes: act === 'code' ? [code] : [] };
    var testDraft = Object.assign(draft(), { id: 'PR-TEST', status: 'active', schedule: { start: null, end: null } });
    var alone = !s.mounted ? null : evaluate(testCart, null, test.ch, { offers: [testDraft] });
    var withAll = !s.mounted ? null : evaluate(testCart, null, test.ch, { offers: [testDraft].concat(otherOffers().filter(function (o) { return !(act === 'code' && o.code === code); })) });
    var clash = !s.mounted ? [] : overlaps(Object.assign(draft(), { id: 'PR-TEST' }));
    var payRule = pmode === 'online' ? ' · pay by ' + ONLINE.filter(function (m) { return pm[m.k]; }).map(function (m) { return m.label; }).join(', ') : pmode === 'cod' ? ' · cash on delivery only' : pmode === 'split' ? ' · discount depends on payment' : '';
    return {
      ideas: IDEAS.map(function (x) { var on = x.k === idea; return { code: x.code, title: x.title, sub: x.sub, on: on, border: on ? '#003087' : '#e2e8f0', bg: on ? '#f2f6fc' : '#ffffff', pick: pickIdea(x) }; }),
      kinds: KINDS.map(function (x) { var on = x.k === kind; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ kind: x.k, amt: x.k === 'pct' ? 10 : 200, errs: __without(errs, 'amt') }); } }; }), hasAmt: kind === 'tk' || kind === 'pct', isPct: kind === 'pct', unit: kind === 'pct' ? '% off' : 'taka off',
      amt: amt, cap: cap, minb: minb, lim: lim, code: code,
      errs: errs,
      typeAmt: function (e) { var d = e.target.value.replace(/[^0-9]/g, ''); self.setState({ amt: d === '' ? '' : Math.min(amtMax, +d), errs: __without(errs, 'amt') }); },
      dStart: dStart, dEnd: dEnd, endTxt: endTxt,
      typeStart: function (e) { self.setState({ dStart: e.target.value, errs: __without(__without(errs, 'start'), 'end') }); },
      typeEnd: function (e) { self.setState({ dEnd: e.target.value, errs: __without(errs, 'end') }); },
      typeCode: function (e) { self.setState({ code: e.target.value.replace(/\s/g, ''), errs: __without(errs, 'code') }); },
      autoCode: function () { var n = (s.n || 0) + 1; self.setState({ n: n, errs: __without(errs, 'code'), code: WORDS[n % WORDS.length] + (kind === 'pct' ? amt.v : kind === 'tk' ? amt.v : '') }); },
      whos: mkChips(this, WHOS, s.who || I.who, 'who'), prods: mkChips(this, PRODS, s.prod || 'all', 'prod'), wheres: mkChips(this, WHERES, s.where || 'both', 'where'),
      once: mkSw(this, 'once', true),
      acts: ACTS.map(function (x) { return { label: x.label, on: x.k === act, pick: function () { self.setState({ act: x.k, errs: {} }); } }; }), isAuto: act === 'auto',
      oname: s.oname || '', typeOname: function (e) { self.setState({ oname: e.target.value, errs: __without(errs, 'oname') }); },
      isBxgy: kind === 'bxgy', isTiered: kind === 'tiered', isGift: kind === 'gift', products: PRODUCTS, cats: CATS,
      bx: bx, setBx: function (k, val) { var o = assign2(bx); o[k] = val; self.setState({ bx: o }); },
      brackets: brackets, setBracket: function (i, k, val) { var b = brackets.map(function (x) { return assign2(x); }); b[i][k] = Math.max(0, +val || 0); self.setState({ brackets: b }); },
      giftSku: giftSku, setGift: function (e) { self.setState({ giftSku: e.target.value }); },
      isCat: prodK === 'cat', isSome: prodK === 'some', cat: cat, setCat: function (e) { self.setState({ cat: e.target.value }); },
      skus: skus, setSku: function (e) { self.setState({ skus: [e.target.value] }); },
      isOne: whoK === 'one', onePhone: s.onePhone || '', typeOne: function (e) { self.setState({ onePhone: e.target.value, errs: __without(errs, 'one') }); },
      combine: COMBINE.map(function (c) { var on = combine.indexOf(c) >= 0; return { label: PROMO_CLASSES[c], on: on, check: true, pick: function () { self.setState({ combine: on ? combine.filter(function (x) { return x !== c; }) : combine.concat([c]) }); } }; }),
      clash: clash.map(function (o) { return o.name; }),
      test: test, setTest: function (k, val) { var o = assign2(test); o[k] = val; self.setState({ test: o }); },
      testMine: alone ? (alone.applied.length ? alone.applied[0] : null) : null, testWhy: alone && !alone.applied.length ? ((alone.skipped[0] || {}).reason || (alone.hints[0] || {}).text || 'Not eligible') : '',
      testAll: withAll ? withAll.applied : [], testSkipped: withAll ? withAll.skipped.filter(function (x) { return x.id === 'PR-TEST'; }) : [], testTotal: withAll ? withAll.total : 0, testSub: withAll ? withAll.subtotal + withAll.delivery : 0, testGifts: withAll ? withAll.gifts : [],
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
      imgBg: s.img === 'auto' ? 'linear-gradient(135deg, var(--primary-900), var(--primary-600))' : 'linear-gradient(160deg, rgba(15,23,42,.1), rgba(15,23,42,.55)), linear-gradient(135deg, var(--error), var(--warning))',
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
        if ((kind === 'tk' || kind === 'pct') && !(+amtV > 0)) add('amt', 'cp-amt', 'Enter how much the customer gets off.');
        if (act === 'code' && !code) add('code', 'cp-code', 'Enter the code customers will type.');
        else if (act === 'code' && !/^[A-Z0-9]{3,20}$/.test(code)) add('code', 'cp-code', 'Use 3 to 20 letters or numbers, with no spaces or symbols.');
        if (act === 'auto' && !String(s.oname || '').trim()) add('oname', 'cp-oname', 'Name the offer.');
        if ((s.who || I.who) === 'one' && !/^01[3-9]\d{8}$/.test(String(s.onePhone || '').replace(/\D/g, '').replace(/^88/, ''))) add('one', 'cp-one', 'Enter the customer’s mobile number.');
        if (!dStart) add('start', 'cp-start', 'Choose the day the code starts.');
        if (dStart && dEnd && dEnd < dStart) add('end', 'cp-end', 'The end date must be on or after the start date.');
        if (onPageOn && !title.trim()) add('title', 'cp-title', 'Enter a title for the offer post.');
        if (first) { self.setState({ errs: er }); __focusSoon(first); return; }
        self.setState({ errs: {} });
        var out = saveOffer(draft());
        if (out.error) { self.setState({ errs: { code: out.error } }); __focusSoon('cp-code'); return; }
        __toast(act === 'code' ? code + ' is on. Customers can use it from today.' : out.offer.name + ' is on. It applies by itself.');
        navigate(act === 'code' ? '/coupons' : '/promo');
      }
    };
  }
}

// ---- styles ----

const CSS = `
.nc-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.nc-opt{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.nc-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.nc-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.nc-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.nc-radio{display:grid;flex:none;place-items:center;width:16px;height:16px;margin-top:2px;border:2px solid var(--border-strong);border-radius:var(--radius-full)}
.nc-opt[aria-pressed="true"] .nc-radio{border-color:var(--primary)}
.nc-opt[aria-pressed="true"] .nc-radio::after{content:"";width:8px;height:8px;border-radius:var(--radius-full);background:var(--primary)}
.nc-box{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.nc-note{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:1.5}
.nc-note svg{flex:none;margin-top:1px}
.nc-note--info{background:var(--fill-info-soft);color:var(--text-info)}
.nc-note--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.nc-split{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.nc-split>div{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle)}
.nc-split>div:first-child{border-top:0}
.nc-split>div.is-off{background:var(--surface-subtle)}
.nc-what{flex:1 1 140px;min-width:0;font-size:var(--text-xs);color:var(--text-muted)}
.nc-pm{min-width:96px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.nc-code{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--primary)}
.nc-coderow{display:flex;gap:var(--space-2)}
.nc-coderow .gc-input{max-width:320px}
.nc-imgs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.nc-imgs>button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:120px;padding:var(--space-2);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.nc-imgs>button b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.nc-imgs>button.is-cover{border-style:solid;background:var(--surface-card)}
.nc-cover{display:flex;align-items:center;justify-content:center;width:100%;flex:1;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--primary-900),var(--primary-600));font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-on-dark)}
.nc-img{display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center}
.nc-img__pic{position:relative;display:flex;flex-direction:column;justify-content:flex-end;width:260px;max-width:100%;height:136px;padding:var(--space-3);border-radius:var(--radius-lg);overflow:hidden;color:var(--text-on-dark)}
.nc-img__pic small{position:absolute;top:8px;left:8px;padding:0 8px;border-radius:var(--radius-full);background:rgba(255,255,255,.22);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:20px}
.nc-img__pic b{font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.nc-tools{display:flex;gap:2px;padding:4px;border:1px solid var(--border-field);border-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;background:var(--surface-subtle)}
.nc-lblrow{display:flex;align-items:center;gap:var(--space-2)}
.nc-lblrow>label{flex:1;margin:0}
.nc-sd{height:auto;font-family:var(--font-bn);resize:none}
.nc-full{height:auto;padding:var(--space-2) var(--space-3);border-radius:0 0 var(--radius-lg) var(--radius-lg);font-family:var(--font-bn);line-height:1.6;resize:vertical}
.nc-ticket{position:relative;display:flex;border-radius:var(--radius-lg);overflow:hidden;background:linear-gradient(135deg,var(--primary-900),var(--primary) 55%,var(--primary-600));color:var(--text-on-dark)}
.nc-ticket>div:first-child{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;padding:var(--space-3)}
.nc-ticket>div:first-child b{font-size:var(--text-xl);font-weight:var(--weight-semibold);line-height:1.2}
.nc-ticket>div:first-child span{font-size:var(--text-xs);opacity:.85}
.nc-ticket>div:last-child{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:96px;padding:var(--space-2);border-left:2px dashed rgba(255,255,255,.4);font-size:var(--text-xs)}
.nc-ticket>div:last-child b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);text-align:center;word-break:break-all}
.nc-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.nc-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.nc-side .ix-card__body .ly-row .gc-select{min-width:0}
.nc-test{margin:0;font-size:var(--text-sm)}
.nc-test b{font-weight:var(--weight-medium)}
@media (max-width:640px){.nc-opts,.nc-imgs{grid-template-columns:minmax(0,1fr)}.nc-coderow{flex-direction:column}.nc-coderow .gc-input{max-width:none}}
`;

// ---- markup ----

const chips = (list, label) => (
  <div className="ix-chips" role="group" aria-label={label}>
    {list.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.on && c.check ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>)}
  </div>
);
const swRow = (sw, title, tip) => (
  <div className="ly-set"><div><b>{title}{tip ? <InfoTip text={tip} /> : null}</b></div><Switch on={sw?.on} onToggle={sw?.toggle} label={title} /></div>
);

export default class NewCouponScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewCoupon">
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="promo-coupons" />
          <main className="gc-shell__main">
            <__Topbar crumb="Marketing" page="New coupon" placeholder="Search a code" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/coupons" backLabel="Coupons" title="Make a new code" primary={{ label: 'Save and turn on', onClick: v.submit }} />
                <form noValidate onSubmit={v.submit} aria-label="New discount code" className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card nc-card" aria-labelledby="nc-s0">
                      <header className="ix-card__head"><h2 id="nc-s0">How does it start?</h2></header>
                      <div className="ix-card__body">
                        {chips(v.acts, 'How does it start?')}
                        {v.isAuto ? (
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-oname">Offer name<__Req /></label>
                            <input id="cp-oname" className="gc-input" value={v.oname} onChange={v.typeOname} placeholder="e.g. Buy 2 chargers, get earphones 50% off" {...__inv(v.errs?.oname, "cp-oname-err")} />
                            <__Err id="cp-oname-err" msg={v.errs?.oname} />
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="ix-card nc-card" aria-labelledby="nc-s1">
                      <header className="ix-card__head"><h2 id="nc-s1">What does the customer get?</h2></header>
                      <div className="ix-card__body">
                        {chips(v.kinds, 'Discount type')}
                        {v.isBxgy ? (<>
                          <div className="ly-row"><span>Buy</span><Steps label="pieces to buy" display={v.bx.buyQty} onDec={() => v.setBx('buyQty', Math.max(1, v.bx.buyQty - 1))} onInc={() => v.setBx('buyQty', v.bx.buyQty + 1)} /><select className="gc-input gc-select ly-grow" aria-label="Product to buy" value={v.bx.buySku} onChange={(e) => v.setBx('buySku', e.target.value)}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select></div>
                          <div className="ly-row"><span>Get</span><Steps label="pieces they get" display={v.bx.getQty} onDec={() => v.setBx('getQty', Math.max(1, v.bx.getQty - 1))} onInc={() => v.setBx('getQty', v.bx.getQty + 1)} /><select className="gc-input gc-select ly-grow" aria-label="Product they get" value={v.bx.getSku} onChange={(e) => v.setBx('getSku', e.target.value)}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select></div>
                          <div className="ly-row"><span>at</span><Steps label="discount on what they get" display={v.bx.getPct >= 100 ? 'Free' : v.bx.getPct + '%'} onDec={() => v.setBx('getPct', Math.max(10, v.bx.getPct - 10))} onInc={() => v.setBx('getPct', Math.min(100, v.bx.getPct + 10))} /><span>off</span></div>
                        </>) : null}
                        {v.isTiered ? v.brackets.map((b, i) => (
                          <div key={i} className="ly-row"><span>{i ? 'And from' : 'From'}</span><Steps label={`pieces for step ${i + 1}`} display={b.min} onDec={() => v.setBracket(i, 'min', Math.max(1, b.min - 1))} onInc={() => v.setBracket(i, 'min', b.min + 1)} /><span>pieces,</span><Steps label={`discount for step ${i + 1}`} display={b.pct + '%'} onDec={() => v.setBracket(i, 'pct', Math.max(1, b.pct - 1))} onInc={() => v.setBracket(i, 'pct', Math.min(90, b.pct + 1))} /><span>off</span></div>
                        )) : null}
                        {v.isGift ? (
                          <div className="ly-field"><label className="gc-label" htmlFor="cp-gift">Free gift <InfoTip text="Added at ৳0 when the offer applies, if it is in stock. Pick which products earn it under Who can use it." /></label><select id="cp-gift" className="gc-input gc-select" value={v.giftSku} onChange={v.setGift}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select></div>
                        ) : null}
                        {v.hasAmt ? (
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-amt">Discount<__Req /></label>
                            <div className="ly-row">
                              <Steps label="discount" less="Less discount" more="More discount" onDec={v.amt?.dec} onInc={v.amt?.inc} invalid={!!v.errs?.amt}>
                                <input id="cp-amt" type="text" inputMode="numeric" autoComplete="off" value={v.amt?.v} onChange={v.typeAmt} aria-required="true" {...__inv(v.errs?.amt, "cp-amt-err")} />
                              </Steps>
                              <span>{v.unit}</span>
                              {v.isPct ? (<>
                                <span>but not more than</span>
                                <Steps label="maximum discount" less="Less maximum discount" more="More maximum discount" display={v.cap?.v} onDec={v.cap?.dec} onInc={v.cap?.inc} />
                                <span>taka</span>
                              </>) : null}
                            </div>
                            <__Err id="cp-amt-err" msg={v.errs?.amt} />
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {v.isAuto ? null : <section className="ix-card nc-card" aria-labelledby="nc-s2">
                      <header className="ix-card__head"><h2 id="nc-s2">Name the code <InfoTip text="Customers type this. Keep it short and easy to say." /></h2></header>
                      <div className="ix-card__body">
                        <div className="ly-field">
                          <label className="gc-label" htmlFor="cp-code">Code<__Req /></label>
                          <div className="nc-coderow">
                            <input id="cp-code" className="gc-input nc-code" value={v.code} onChange={v.typeCode} autoComplete="off" spellCheck="false" aria-required="true" {...__inv(v.errs?.code, "cp-code-err")} />
                            <button type="button" className="ix-btn" onClick={v.autoCode}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />Make one for me</button>
                          </div>
                          <__Err id="cp-code-err" msg={v.errs?.code} />
                        </div>
                      </div>
                    </section>}

                    <section className="ix-card nc-card" aria-labelledby="nc-s3">
                      <header className="ix-card__head"><h2 id="nc-s3">Who can use it?</h2></header>
                      <div className="ix-card__body">
                        <div className="ly-field"><span className="gc-label">Customers</span>{chips(v.whos, 'Customers')}</div>
                        {v.isOne ? (
                          <div className="ly-field"><label className="gc-label" htmlFor="cp-one">Customer’s mobile number<__Req /></label><input id="cp-one" className="gc-input" inputMode="tel" value={v.onePhone} onChange={v.typeOne} placeholder="01XXXXXXXXX" {...__inv(v.errs?.one, "cp-one-err")} /><__Err id="cp-one-err" msg={v.errs?.one} /></div>
                        ) : null}
                        <div className="ly-field"><span className="gc-label">Products</span>{chips(v.prods, 'Products')}</div>
                        {v.isCat ? <div className="ly-field"><label className="gc-label" htmlFor="cp-cat">Category</label><select id="cp-cat" className="gc-input gc-select" value={v.cat} onChange={v.setCat}>{v.cats.map((c) => <option key={c}>{c}</option>)}</select></div> : null}
                        {v.isSome ? <div className="ly-field"><label className="gc-label" htmlFor="cp-sku">Product</label><select id="cp-sku" className="gc-input gc-select" value={v.skus[0]} onChange={v.setSku}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select></div> : null}
                        <div className="ly-row">
                          <span>Only when the bill is at least</span>
                          <Steps label="minimum bill" less="Less minimum bill" more="More minimum bill" display={v.minb?.v} onDec={v.minb?.dec} onInc={v.minb?.inc} />
                          <span>taka</span>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card nc-card" aria-labelledby="nc-s4">
                      <header className="ix-card__head"><h2 id="nc-s4">How must they pay? <InfoTip text="Make the offer work only for some payments, or give a different discount for each one." /></h2></header>
                      <div className="ix-card__body">
                        <div className="nc-opts">
                          {v.pmodes.map((o) => (
                            <button key={o.label} type="button" className="nc-opt" onClick={o.pick} aria-pressed={o.on}>
                              <span className="nc-radio" aria-hidden="true" />
                              <span><b>{o.label}</b><small>{o.sub}</small></span>
                            </button>
                          ))}
                        </div>
                        {v.isOnline ? (<>
                          <div className="ly-field"><span className="gc-label">The code works when the customer pays with</span>{chips(v.methods.map((m) => ({ ...m, check: true })), 'Payment methods')}</div>
                          {v.showBanks ? (
                            <div className="nc-box">
                              <span className="gc-label">Which cards? <InfoTip text="For a bank partner offer, pick the bank." /></span>
                              {chips(v.cardModes, 'Which cards?')}
                              {v.someBanks ? chips(v.banks.map((b) => ({ ...b, check: true })), 'Banks') : null}
                            </div>
                          ) : null}
                          <div className="nc-note nc-note--info"><__Icon name="info" width="16" height="16" aria-hidden="true" /><span>Cash on delivery is hidden when this code is used. If the online payment fails, the code is removed and the customer can try again.</span></div>
                        </>) : null}
                        {v.isSplit ? (<>
                          <p className="ly-help">Give a bigger discount for the payment you like most. Turn off the ones that get nothing.</p>
                          <div className="nc-split">
                            {v.split.map((r) => (
                              <div key={r.label} className={r.on ? '' : 'is-off'}>
                                <span className="nc-pm">{r.label}</span>
                                <span className={'nc-what' + (r.on ? ' ly-in' : '')}>{r.note}</span>
                                {r.showAmt ? (<><Steps label={`discount for ${r.label}`} less={`Less discount for ${r.label}`} more={`More discount for ${r.label}`} display={r.v} onDec={r.dn} onInc={r.up} /><span className="ly-help">{r.unit}</span></>) : null}
                                <Switch on={r.on} onToggle={r.toggle} label={`Discount for ${r.label}`} />
                              </div>
                            ))}
                          </div>
                        </>) : null}
                        {v.isCod ? <div className="nc-note nc-note--warn"><__Icon name="info" width="16" height="16" aria-hidden="true" /><span>Good for areas where people trust cash more. Online payments will not get this discount.</span></div> : null}
                      </div>
                    </section>

                    <section className="ix-card nc-card" aria-labelledby="nc-s5">
                      <header className="ix-card__head"><h2 id="nc-s5">Where can they use it?</h2></header>
                      <div className="ix-card__body">{chips(v.wheres, 'Where can they use it?')}</div>
                    </section>

                    <section className="ix-card nc-card" aria-labelledby="nc-s6">
                      <header className="ix-card__head"><h2 id="nc-s6">When, and how many times?</h2></header>
                      <div className="ix-card__body">
                        <div className="ly-two">
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-start">Starts<__Req /></label>
                            <input id="cp-start" className="gc-input" type="date" value={v.dStart} onChange={v.typeStart} aria-required="true" {...__inv(v.errs?.start, "cp-start-err")} />
                            <__Err id="cp-start-err" msg={v.errs?.start} />
                          </div>
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-end">Ends <InfoTip text="Leave empty to keep it on always." /></label>
                            <input id="cp-end" className="gc-input" type="date" value={v.dEnd} onChange={v.typeEnd} {...(v.errs?.end ? { "aria-invalid": "true", "aria-describedby": "cp-end-err" } : {})} />
                            <__Err id="cp-end-err" msg={v.errs?.end} />
                          </div>
                        </div>
                        <div className="ly-row">
                          <span>Stop after it is used</span>
                          <Steps label="use limit" less="Less use limit" more="More use limit" display={v.lim?.v} onDec={v.lim?.dec} onInc={v.lim?.inc} />
                          <span>times in total</span>
                        </div>
                        <div>
                          {swRow(v.once, 'One time per customer', 'Counted per customer, not per phone number')}
                        </div>
                        <div className="ly-field">
                          <span className="gc-label">Can combine with <InfoTip text="When two offers fit one cart, they apply together only if both allow it. Otherwise the bigger one wins." /></span>
                          {chips(v.combine, 'Can combine with')}
                        </div>
                        {v.clash.length ? <div className="nc-note nc-note--warn"><__Icon name="info" width="16" height="16" aria-hidden="true" /><span>Overlaps with {v.clash.slice(0, 3).join(', ')}{v.clash.length > 3 ? ' and more' : ''}. The bigger offer wins where they can’t combine.</span></div> : null}
                      </div>
                    </section>

                    <section className="ix-card nc-card" aria-labelledby="nc-s7">
                      <header className="ix-card__head"><h2 id="nc-s7">Offer post on your website <InfoTip text={"Every offer gets its own post on the Offers & Promotions page, with a day counter. After the end date it shows as “Ended”."} /></h2></header>
                      <div className="ix-card__body">
                        {swRow(v.onPage, 'Show on the Offers & Promotions page', 'Customers find the offer by themselves — no need to send an SMS.')}
                        {v.onPage?.on ? (<>
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-title">Post title<__Req /></label>
                            <input id="cp-title" className="gc-input" value={v.postTitle} onChange={v.typeTitle} aria-required="true" {...__inv(v.errs?.title, "cp-title-err")} />
                            <__Err id="cp-title-err" msg={v.errs?.title} />
                            <p className="ly-help">Link: dazzleshop.com.bd/offers/{v.slug}</p>
                          </div>
                          <div className="ly-field">
                            <span className="gc-label">Featured image</span>
                            {v.noImg ? (
                              <div className="nc-imgs">
                                <button type="button" onClick={v.upload}><__Icon name="image-up" width="20" height="20" aria-hidden="true" /><b>Upload a picture</b><span>JPG or PNG · 1200 × 630 is best</span></button>
                                <button type="button" className="is-cover" onClick={v.useAuto}><span className="nc-cover">{v.bigGets}</span><b>No picture? Use a ready cover</b></button>
                              </div>
                            ) : (
                              <div className="nc-img">
                                <div className="nc-img__pic" style={{ background: v.imgBg }}><small>{v.imgTag}</small><b>{v.imgText}</b></div>
                                <div className="ly-field">
                                  <span className="ix-strong">{v.imgName}</span>
                                  <span className="ly-help">{v.imgNote}</span>
                                  <span className="ix-chips"><button type="button" className="ix-btn ix-btn--sm" onClick={v.upload}><__Icon name="upload" width="16" height="16" aria-hidden="true" />Change</button><button type="button" className="ix-btn ix-btn--sm" onClick={v.removeImg}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" />Remove</button></span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ly-field">
                            <span className="nc-lblrow"><label className="gc-label" htmlFor="cp-sd">Short description <InfoTip text="One or two lines. Shown on the offer card and on the coupon at checkout." /></label><span className="ly-help">{v.sdCount}</span></span>
                            <textarea id="cp-sd" className="gc-input nc-sd" rows="2" value={v.sd} onChange={v.typeSd} />
                          </div>
                          <div className="ly-field">
                            <label className="gc-label" htmlFor="cp-full">Full description <InfoTip text="Tell the story of the offer. Bangla and English both work. Terms are added below the post by themselves." /></label>
                            <div>
                              <div className="nc-tools">
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Bold"><__Icon name="bold" width="16" height="16" aria-hidden="true" /></button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Italic"><__Icon name="italic" width="16" height="16" aria-hidden="true" /></button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="List"><__Icon name="list" width="16" height="16" aria-hidden="true" /></button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Add link"><__Icon name="link" width="16" height="16" aria-hidden="true" /></button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Add picture"><__Icon name="image" width="16" height="16" aria-hidden="true" /></button>
                              </div>
                              <textarea id="cp-full" className="gc-input nc-full" rows="6" defaultValue={v.fullDesc} />
                            </div>
                          </div>
                        </>) : null}
                        {swRow(v.atCheckout, 'Show at checkout as a ready coupon', 'Customers tap it to use it. Turn off to keep the code secret (they must type it).')}
                      </div>
                    </section>
                  </div>

                  <aside className="ix-side nc-side">
                    <section className="ix-card" aria-labelledby="nc-see">
                      <header className="ix-card__head"><h2 id="nc-see">Customer will see</h2></header>
                      <div className="ix-card__body">
                        <div className="nc-ticket">
                          <div><b>{v.bigGets}</b><span>{v.smallRule}</span><span>{v.endTxt}</span></div>
                          {v.isAuto ? <div><span>NO CODE</span><b>AUTO</b></div> : <div><span>USE CODE</span><b>{v.code}</b></div>}
                        </div>
                        <button type="submit" className="ix-btn ix-btn--primary">Save and turn on</button>
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="nc-test">
                      <header className="ix-card__head"><h2 id="nc-test">Test this offer</h2></header>
                      <div className="ix-card__body">
                        <div className="ly-row"><select className="gc-input gc-select ly-grow" aria-label="Product 1" value={v.test.sku} onChange={(e) => v.setTest('sku', e.target.value)}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select><Steps label="quantity of product 1" display={v.test.qty} onDec={() => v.setTest('qty', Math.max(0, v.test.qty - 1))} onInc={() => v.setTest('qty', v.test.qty + 1)} /></div>
                        <div className="ly-row"><select className="gc-input gc-select ly-grow" aria-label="Product 2" value={v.test.sku2} onChange={(e) => v.setTest('sku2', e.target.value)}>{v.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select><Steps label="quantity of product 2" display={v.test.qty2} onDec={() => v.setTest('qty2', Math.max(0, v.test.qty2 - 1))} onInc={() => v.setTest('qty2', v.test.qty2 + 1)} /></div>
                        <div className="ly-two">
                          <select className="gc-input gc-select" aria-label="Payment" value={v.test.pay} onChange={(e) => v.setTest('pay', e.target.value)}>{PAY_TEST.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                          <select className="gc-input gc-select" aria-label="Where" value={v.test.ch} onChange={(e) => v.setTest('ch', e.target.value)}><option value="online">Website</option><option value="pos">POS counter</option></select>
                        </div>
                        {v.testMine ? <p className="nc-test ly-in"><b>Applies:</b> {v.testMine.discount ? '− ' + bdt(v.testMine.discount) : v.testMine.delivery ? 'free delivery' : v.testMine.gifts.length ? 'free ' + v.testMine.gifts[0].name : v.testMine.label}</p> : <p className="nc-test ly-out"><b>Doesn’t apply:</b> {v.testWhy}</p>}
                        {v.testSkipped.length ? <p className="nc-test ly-out">With the other offers: {v.testSkipped[0].reason}</p> : null}
                        {v.testAll.length ? <p className="ly-help">All offers on this cart: {v.testAll.map((a) => a.code || a.name).join(', ')} · pays {bdt(v.testTotal)} of {bdt(v.testSub)}</p> : null}
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
