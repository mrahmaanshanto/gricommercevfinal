'use client';
// Generated from design/templates/customers-crm/CustomerCRM.dc.html by scripts/convert-design.mjs.
// CustomerCRM — Customers CRM — Customer CRM.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as uiToast } from '@/runtime/ui';
import { getDemoEdits, saveDemoEdit } from '@/lib/customerEdits';
import { phoneDigits } from '@/lib/customers';
import CustomerEditDialog from './CustomerEditDialog';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }

var ORDERS = [
  ['#GC-10471', '12 Sep 2026', 'Sunscreen SPF 50, Toner +1', 'bKash', 'SKIN15', 4860, 'Delivered'],
  ['#GC-10402', '2 Sep 2026', 'Vitamin C Serum', 'bKash', '—', 1450, 'Delivered'],
  ['#GC-10355', '26 Aug 2026', 'Night Repair Cream', 'Cash on delivery', '—', 1690, 'Cancelled'],
  ['#GC-10311', '22 Aug 2026', 'Kurti, Lip Balm +3', 'Cash on delivery', 'EID300', 6120, 'Delivered'],
  ['#GC-10207', '14 Aug 2026', 'Aloe Vera Gel', 'Nagad', '—', 650, 'Returned'],
  ['#GC-10150', '3 Aug 2026', 'Rice Water Cleanser +2', 'Card', 'FIRST20', 3240, 'Delivered'],
  ['#GC-10044', '20 Jul 2026', 'Cotton Face Towel ×3', 'bKash', '—', 1180, 'Delivered'],
  ['#GC-09870', '28 Jun 2026', 'Sunscreen SPF 50 ×2', 'Wallet', '—', 2500, 'Delivered']
];
var OCLS = { Delivered: 'badge b-received', Cancelled: 'badge b-cancelled', Returned: 'badge b-approval' };
var TL = [
  ['CART', '#fff4e0', '#a14f06', 'Left 3 items in her cart', 'Sunscreen SPF 50, Lip Balm, Face Towel · ৳3,240', 'Today, 10:45 AM'],
  ['LOG', '#eef2f6', '#475569', 'Logged in', 'Chrome on Android · 103.112.54.21', 'Today, 10:42 AM'],
  ['MSG', '#dcfce7', '#166534', 'Cart reminder sent on WhatsApp', 'Opened', 'Today, 11:45 AM'],
  ['ORD', '#e7f8f1', '#047857', 'Order #GC-10471 delivered', '৳4,860 · bKash · 180 points earned', '12 Sep 2026'],
  ['TIX', '#e0f2fe', '#075985', 'Ticket #T-2210 solved', 'Asked about delivery time · 14 min', '10 Sep 2026'],
  ['CPN', 'rgba(0,48,135,.08)', '#003087', 'Got coupon SKIN15', 'From “Bought sunscreen, try toner”', '8 Sep 2026'],
  ['RET', '#ffece6', '#b83210', 'Returned Aloe Vera Gel', 'Wrong size · refund ৳650 to wallet', '28 Aug 2026']
];
var COUP = [
  ['NUS7Q2', '10% off Vitamin C Serum', 'Smart offer · Looked but didn’t buy', '19 Sep 2026', 'Unused', 'Ends 22 Sep'],
  ['SKIN15', '15% off skin care', 'Offers page', '8 Sep 2026', 'Used', 'On #GC-10471 · saved ৳726'],
  ['EID300', '৳300 off on ৳2,000+', 'Checkout', '20 Aug 2026', 'Used', 'On #GC-10311'],
  ['NUSWB5', '5% off', 'Smart offer · Win them back', '1 Aug 2026', 'Expired', 'Not used'],
  ['FIRST20', '20% off first order', 'Sign-up', '2 Mar 2026', 'Used', 'On #GC-10150'],
  ['SORRY100', '৳100 off', 'Given by Tania', '10 Sep 2026', 'Unused', 'No end date']
];
var CCLS = { Used: 'badge b-received', Unused: 'badge b-approved', Expired: 'badge b-ended' };
var HIST = [
  ['wa', 'Today 11:45 AM', 'Automatic · cart reminder', 'Read', 'Hi Nusrat, you left something in your cart at GridShop. Finish your order here: gridshop.com.bd/c/8K2Q'],
  ['sms', '19 Sep 9:10 AM', 'Smart offer', 'Delivered', 'Hi Nusrat, still thinking about Vitamin C Serum? 10% off with code NUS7Q2, till 22 Sep.'],
  ['email', '12 Sep 6:02 PM', 'Automatic · order', 'Opened', 'Your order #GC-10471 is delivered. You earned 180 points.'],
  ['sms', '10 Sep 3:20 PM', 'Tania (support)', 'Delivered', 'দুঃখিত দেরির জন্য। আপনার জন্য ৳১০০ ছাড়: SORRY100']
];
var IPS = [
  ['103.112.54.21', 'Mirpur, Dhaka', 'Grameenphone', 'Chrome · Android', '4 Jun 2026', 'Today 10:42 AM', 38],
  ['103.87.214.9', 'Dhanmondi, Dhaka', 'Link3 broadband', 'Chrome · Windows', '2 Mar 2026', '16 Sep 2026', 21],
  ['37.111.205.64', 'Mirpur, Dhaka', 'Robi', 'Safari · iPhone', '12 Jul 2026', '28 Aug 2026', 6],
  ['180.211.160.17', 'Chattogram', 'Banglalink', 'Chrome · Android', '14 Aug 2026', '14 Aug 2026', 1]
];
var ADDR0 = [
  { id: 'a1', label: 'Home', line: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', who: 'Nusrat Jahan', phone: '01552-3X1-907', used: 'used in 11 orders' },
  { id: 'a2', label: 'Office', line: 'Level 6, Rangs Nasim Square, Road 16 (old 27), Dhanmondi, Dhaka 1209', who: 'Nusrat Jahan', phone: '01552-3X1-907', used: 'used in 2 orders' },
  { id: 'a3', label: 'Sister’s house', line: 'Flat 3B, Chandrima Tower, Agrabad C/A, Chattogram 4100', who: 'Nasrin Jahan', phone: '01819-4X2-770', used: 'used in 1 order' }
];
var ALABELS = ['Home', 'Office', 'Family', 'Other'];
var TAGS = ['VIP', 'Wholesale', 'Influencer', 'Staff', 'Fraud watch', 'Prefers call'];
var TABS = [['overview', 'Overview'], ['orders', 'Orders'], ['tickets', 'Support tickets'], ['carts', 'Cart & favourites'], ['search', 'Searches & views'], ['rewards', 'Coupons & rewards'], ['messages', 'Messages'], ['security', 'Logins & IPs'], ['notes', 'Notes'], ['settings', 'Controls']];
var CNT = { overview: null, orders: 14, tickets: 3, carts: 1, search: 6, rewards: 9, messages: 23, security: 4, notes: 2 };
var MDEF = { sms: 'Hi {name}, ', wa: 'Hi {name}, ', email: 'Hi {name},\n\n' };
// This profile shows the demo list customer c01 (Nusrat Jahan); edits made here and on All customers
// are kept in this browser under the same id.
var PROFILE_ID = 'c01';
var PROFILE0 = { name: 'Nusrat Jahan', phone: '01552-3X1-907', address: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', types: ['Online'], tier: 'A', creditLimit: 0 };
function areaOf(address) { var parts = String(address || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); return parts.slice(-2).join(', ').replace(/\s+\d{4}$/, '') || 'No address on file'; }
class Component extends DCLogic {
  componentDidMount() { this.setState({ prof: assign(assign({}, PROFILE0), getDemoEdits()[PROFILE_ID] || {}) }); }
  componentWillUnmount() { clearTimeout(this.t); }
  saveProfile = (vals) => {
    var prev = (this.state || {}).prof || PROFILE0, wasWhole = (prev.types || []).indexOf('Wholesale') >= 0, isWhole = vals.types.indexOf('Wholesale') >= 0;
    var patch = { name: vals.name, phone: vals.phone, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit, due: 0 };
    saveDemoEdit(PROFILE_ID, patch);
    this.setState({ prof: assign(assign({}, prev), patch), editProf: null });
    uiToast(vals.name + ' was updated.' + (isWhole && !wasWhole ? ' They now show under Wholesale customers.' : ''));
  };
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || 'overview', susp = !!s.susp, pay = s.pay || { pCod: true, pBkash: true, pNagad: true, pCard: true, pWallet: true }, con = s.con || { cSms: true, cWa: true, cEmail: false };
    var pts = s.pts != null ? s.pts : 1845, credit = s.credit != null ? s.credit : 1250, tags = s.tags || { VIP: true };
    var mch = s.mch || 'sms', mb = s.mb || {}, body = mb[mch] != null ? mb[mch] : MDEF[mch];
    var notes = s.notes || [{ t: 'Prefers delivery after 6:00 PM. Call before sending.', by: 'Tania · 10 Sep 2026' }, { t: 'Buys for her sister too — good for bundle offers.', by: 'Shanto · 22 Aug 2026' }];
    var mode = s.m;
    var addrs = s.addrs || ADDR0.map(function (a) { return assign({}, a); }), defId = s.defId || 'a1';
    var ordered = addrs.filter(function (a) { return a.id === defId; }).concat(addrs.filter(function (a) { return a.id !== defId; }));
    var sw = function (store, key, label, onTxt, offTxt, stateKey) { var on = !!store[key]; return { on: on, cls: on ? 'sw on' : 'sw', t: on ? onTxt : offTxt, c: on ? '#047857' : '#b83210', toggle: function () { var o = assign({}, store); o[key] = !on; var p = {}; p[stateKey] = o; self.setState(p); toast(self, label + (on ? ' blocked for this customer.' : ' allowed again.'), on); } }; };
    var open = function (m) { return function () { self.setState({ m: m, cAmt: 200, pAmt: 100, pOp: 'give' }); }; };
    var bn = /[ঀ-৿]/.test(body), parts = body.length <= (bn ? 70 : 160) ? 1 : Math.ceil(body.length / (bn ? 67 : 153));
    var prof = s.prof || PROFILE0, profWhole = (prof.types || []).indexOf('Wholesale') >= 0;
    var v = {
      profName: prof.name, profPhone: prof.phone, profArea: areaOf(prof.address), profInitial: prof.name.charAt(0).toUpperCase(), profTypes: (prof.types || []).join(' · '),
      profWhole: profWhole, profWholeHref: '/wholesale-customer?phone=' + phoneDigits(prof.phone) + '&demo=' + PROFILE_ID,
      editProfOpen: !!s.editProf, editProf: s.editProf, saveProfile: self.saveProfile, closeEditProf: function () { self.setState({ editProf: null }); },
      openEditProf: function () { self.setState({ editProf: { name: prof.name, phone: prof.phone, address: prof.address, types: prof.types || ['Online'], tier: prof.tier || 'A', creditLimit: prof.creditLimit || 0 } }); },
      rng: [['12m', '12 months'], ['6m', '6 months']].map(function (r) { var on = r[0] === (s.rng || '12m'); return { l: r[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ rng: r[0] }); } }; }),
      bars: (function () { var M = [['Oct', 0], ['Nov', 1200], ['Dec', 3400], ['Jan', 0], ['Feb', 2100], ['Mar', 5200], ['Apr', 4100], ['May', 6800], ['Jun', 2500], ['Jul', 4600], ['Aug', 11850], ['Sep', 6310]]; if ((s.rng || '12m') === '6m') M = M.slice(6); var mx = 11850; return M.map(function (m, i) { var last = i === M.length - 1; return { m: m[0], v: m[1] ? '৳' + (m[1] >= 1000 ? (m[1] / 1000).toFixed(1) + 'k' : m[1]) : '', lop: m[1] ? 1 : 0, h: Math.max(4, Math.round(m[1] / mx * 150)) + 'px', bg: last ? 'linear-gradient(180deg, #0a5bd0, #003087)' : m[1] === mx ? 'linear-gradient(180deg, #f5c86b, #d69e2e)' : '#dbe4f3', tip: m[0] + ': ' + bdt(m[1]) }; }); })(),
      ringDash: (2 * Math.PI * 74 * 0.39).toFixed(1) + ' ' + (2 * Math.PI * 74).toFixed(1),
      donut: (function () { var L = [['Delivered', 12, '#10b981'], ['Returned', 1, '#f59e0b'], ['Cancelled', 1, '#ef4444']], C = 2 * Math.PI * 52, acc = 0; return L.map(function (x) { var len = x[1] / 14 * C; var d = { l: x[0], n: x[1], c: x[2], dash: len.toFixed(1) + ' ' + C.toFixed(1), off: (-acc).toFixed(1) }; acc += len; return d; }); })(),
      cats: [['Skin care', 36400, '#003087'], ['Clothing', 13100, '#0a5bd0'], ['Personal care', 6200, '#0ea5e9'], ['Grocery', 2500, '#94a3b8']].map(function (c) { return { l: c[0], v: bdt(c[1]), w: Math.round(c[1] / 36400 * 100) + '%', c: c[2] }; }),
      nbaOpen: !s.nba, nbaDone: !!s.nba, nbaTxt: s.nba === 'sent' ? 'Sent · code NUSV10, 3 days' : 'Skipped for 7 days',
      sendNba: function () { self.setState({ nba: 'sent' }); toast(self, '10% off Vitamin C Serum sent on WhatsApp.'); }, skipNba: function () { self.setState({ nba: 'skip' }); },
      wcoupons: COUP.filter(function (c) { return c[4] === 'Unused'; }).concat(COUP.filter(function (c) { return c[4] !== 'Unused'; })).slice(0, 4).map(function (c, i) { var col = c[4] === 'Unused' ? ['#003087', '#0a5bd0', '#047857'][i % 3] : '#475569'; return { code: c[0], gives: c[1], from: c[2], note: c[5], st: c[4] === 'Unused' ? 'Ready' : c[4], cls: CCLS[c[4]], big: /%/.test(c[1]) ? c[1].match(/\d+%/)[0] : (c[1].match(/৳[\d,]+/) || ['GIFT'])[0], bg: col, op: 1 }; }),
      dn0: null, dn1: null, dn2: null,
      goAll: function () { self.setState({ tab: 'orders' }); },
      acctTitle: susp ? 'Account suspended' : 'Suspend this customer', acctSub: susp ? 'Suspended on 19 Sep 2026 by Shanto — ' + (s.susReason || 'Too many returned orders') + '.' : 'Stops her from logging in and ordering. Open orders are not touched.',
      stHeroBg: susp ? 'rgba(248,113,113,.2)' : 'rgba(34,197,94,.18)', stHeroFg: susp ? '#fecaca' : '#bbf7d0',
      addrCount: addrs.length,
      addrs: ordered.map(function (a) { var d = a.id === defId; return { label: a.label, line: a.line, who: a.who, phone: a.phone, used: a.used, isDef: d, notDef: !d, cls: d ? 'addr def fade' : 'addr', iBg: d ? '#003087' : '#eef2f6', iFg: d ? '#fff' : '#475569',
        makeDef: function () { self.setState({ defId: a.id }); toast(self, a.label + ' is now the default address. New orders will use it.'); },
        edit: function () { self.setState({ m: 'addr', editId: a.id, newLbl: a.label, newLine: a.line, newDef: d }); },
        remove: function () { self.setState({ addrs: addrs.filter(function (x) { return x.id !== a.id; }) }); toast(self, a.label + ' address removed.'); } }; }),
      openAddr: function () { self.setState({ m: 'addr', editId: null, newLbl: 'Other', newLine: '', newDef: false }); },
      mAddr: mode === 'addr', newLine: s.newLine || '', typeLine: function (e) { self.setState({ newLine: e.target.value }); },
      newDef: !!s.newDef, toggleNewDef: function () { self.setState({ newDef: !s.newDef }); },
      addrLabels: ALABELS.map(function (l) { var on = l === (s.newLbl || 'Other'); return { l: l, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ newLbl: l }); } }; }),
      stTxt: susp ? 'Suspended' : 'Active', stCls: susp ? 'badge b-cancelled' : 'badge b-received', isActive: !susp, isSusp: susp,
      suspNote: 'Suspended on 19 Sep 2026 by Shanto — ' + (s.susReason || 'Too many returned orders') + '.',
      tags: TAGS.filter(function (t) { return tags[t]; }).map(function (t) { return { t: t }; }),
      tagChips: TAGS.map(function (t) { var on = !!tags[t]; return { label: t, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var o = assign({}, tags); o[t] = !on; self.setState({ tags: o }); } }; }),
      pts: pts.toLocaleString('en-IN'), ptsTk: bdt(pts), credit: bdt(credit), staffCredit: bdt(credit - 1250 + 0 > 0 ? credit - 1250 : 0),
      tabs: mkTabs(this, TABS.map(function (t) { return { k: t[0], label: t[1] }; }), tab, 'tab', CNT).map(function (x) { x.scls = x.on ? 'sbtn on' : 'sbtn'; return x; }),
      orders: ORDERS.map(function (o) { return { no: o[0], date: o[1], items: o[2], pay: o[3], coupon: o[4], amt: bdt(o[5]), st: o[6], cls: OCLS[o[6]] }; }),
      tickets: [{ no: '#T-2210', title: 'When will my order arrive?', sub: 'WhatsApp · 10 Sep · solved by Tania in 14 min', st: 'Solved', cls: 'badge b-received' }, { no: '#T-2104', title: 'Wrong size Aloe Vera Gel', sub: 'Phone · 26 Aug · return approved', st: 'Solved', cls: 'badge b-received' }, { no: '#T-2318', title: 'Can I change the delivery address?', sub: 'Messenger · today · waiting for reply', st: 'Open', cls: 'badge b-approval' }],
      cart: [['Sunscreen SPF 50 · 50ml', 1, '৳1,250', '#fff4e0'], ['Lip Balm Strawberry 4g', 2, '৳480', '#fde7f1'], ['Cotton Face Towel (pack of 3)', 1, '৳1,510', '#e0f3fb']].map(function (i) { return { name: i[0], qty: i[1], price: i[2], bg: i[3], initial: i[0].charAt(0) }; }),
      favs: [['Night Repair Cream 50g', '৳1,690', 'Price dropped ৳200', '#047857'], ['Vitamin C Serum 30ml', '৳1,450', '', '#64748b'], ['Travel Pouch Set', '৳650', 'Back in stock', '#047857'], ['Silk Scarf · Blue', '৳890', 'Low stock', '#a14f06']].map(function (f) { return { name: f[0], price: f[1], note: f[2], nc: f[3], initial: f[0].charAt(0), bg: '#eef2f6' }; }),
      searches: [['vitamin c serum', 'Today', '12 found'], ['sunscreen for oily skin', '16 Sep', '8 found'], ['korean snail mucin', '14 Sep', 'Nothing found'], ['সানস্ক্রিন', '10 Sep', '6 found'], ['retinol cream', '2 Sep', 'Nothing found'], ['eid kurti', '20 Aug', '24 found']].map(function (q) { var no = /Nothing/.test(q[2]); return { q: q[0], when: q[1], res: q[2], bg: no ? '#fff4e0' : '#f8fafc', fg: no ? '#a14f06' : '#64748b' }; }),
      viewed: [['Vitamin C Serum 30ml', '4 times', 'Hot', 'badge b-approval'], ['Cotton Kurti · Blue · M', '3 times', 'Hot', 'badge b-approval'], ['Hyaluronic Toner 150ml', '2 times', 'Warm', 'badge b-approved'], ['Night Repair Cream 50g', '1 time', 'Cold', 'badge b-draft']].map(function (x) { return { name: x[0], times: x[1], tag: x[2], cls: x[3] }; }),
      coupons: COUP.map(function (c) { return { code: c[0], gives: c[1], from: c[2], got: c[3], st: c[4], cls: CCLS[c[4]], note: c[5] }; }),
      mTabs: [['sms', 'SMS'], ['wa', 'WhatsApp'], ['email', 'Email']].map(function (m) { var on = m[0] === mch; return { l: m[1], on: on, bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ mch: m[0] }); } }; }),
      isEmailM: mch === 'email', mSubj: s.subj != null ? s.subj : 'A little something for you, Nusrat', typeSubj: function (e) { self.setState({ subj: e.target.value }); },
      mRows: mch === 'email' ? 7 : 4, mBody: body, typeBody: function (e) { var o = assign({}, mb); o[mch] = e.target.value; self.setState({ mb: o }); },
      mVars: ['{name}', '{points}', '{code}', '{link}'].map(function (t) { return { t: t, pick: function () { var o = assign({}, mb); o[mch] = body + t + ' '; self.setState({ mb: o }); } }; }),
      mCount: mch === 'sms' ? body.length + ' letters · ' + parts + ' SMS' : mch === 'wa' ? body.length + ' / 1,000' : 'No limit',
      sendLabel: 'Send ' + (mch === 'sms' ? 'SMS' : mch === 'wa' ? 'WhatsApp' : 'email'),
      sendMsg: function () { var o = assign({}, mb); o[mch] = MDEF[mch]; self.setState({ mb: o, sent: (s.sent || []).concat([{ ch: mch, text: body.replace('{name}', 'Nusrat') }]) }); toast(self, (mch === 'sms' ? 'SMS' : mch === 'wa' ? 'WhatsApp message' : 'Email') + ' sent to Nusrat.'); },
      history: (s.sent || []).slice().reverse().map(function (h) { return ['' + h.ch, 'Just now', 'You', 'Sent', h.text, true]; }).concat(HIST).map(function (h) { return { ch: CHN[h[0]][0], cBg: CHN[h[0]][1], cFg: CHN[h[0]][2], when: h[1], by: h[2], st: h[3], text: h[4], bg: h[5] ? '#f2f6fc' : '#fff' }; }),
      ips: IPS.map(function (p) { return { ip: p[0], area: p[1], net: p[2], dev: p[3], first: p[4], last: p[5], n: p[6] }; }),
      tl: TL.map(function (e) { return { tag: e[0], bg: e[1], fg: e[2], what: e[3], sub: e[4], when: e[5] }; }),
      noteTxt: s.nt || '', typeNote: function (e) { self.setState({ nt: e.target.value }); },
      addNote: function () { if (!(s.nt || '').trim()) return; self.setState({ nt: '', notes: [{ t: s.nt, by: 'You · just now', fresh: true }].concat(notes) }); },
      notes: notes.map(function (n) { return { t: n.t, by: n.by, cls: n.fresh ? 'fade' : '' }; }),
      pCod: sw(pay, 'pCod', 'Cash on delivery', 'Allowed', 'Blocked', 'pay'), pBkash: sw(pay, 'pBkash', 'bKash', 'Allowed', 'Blocked', 'pay'), pNagad: sw(pay, 'pNagad', 'Nagad', 'Allowed', 'Blocked', 'pay'), pCard: sw(pay, 'pCard', 'Card', 'Allowed', 'Blocked', 'pay'), pWallet: sw(pay, 'pWallet', 'Wallet', 'Allowed', 'Blocked', 'pay'),
      cSms: sw(con, 'cSms', 'SMS offers', 'Yes', 'No', 'con'), cWa: sw(con, 'cWa', 'WhatsApp offers', 'Yes', 'No', 'con'), cEmail: sw(con, 'cEmail', 'Email offers', 'Yes', 'No', 'con'),
      openSms: function () { self.setState({ tab: 'messages', mch: 'sms' }); }, openEmail: function () { self.setState({ tab: 'messages', mch: 'email' }); },
      call: function () { toast(self, 'Calling ' + prof.phone + ' …'); }, remindCart: function () { toast(self, 'Cart reminder sent on WhatsApp.'); },
      logoutAll: function () { toast(self, 'She was logged out of 4 devices.'); }, resetPw: function () { toast(self, 'Password reset link sent by SMS.'); },
      openCoupon: open('coupon'), openCredit: open('credit'), openPoints: open('points'), openSuspend: open('suspend'),
      unsuspend: function () { self.setState({ susp: false }); toast(self, 'Account is active again.'); },
      mOpen: !!mode, mCoupon: mode === 'coupon', mCredit: mode === 'credit', mPoints: mode === 'points', mSuspend: mode === 'suspend',
      mTitle: mode === 'addr' ? (s.editId ? 'Edit address' : 'Add an address') : mode === 'coupon' ? 'Assign a coupon' : mode === 'credit' ? 'Add wallet credit' : mode === 'points' ? 'Give or take points' : 'Suspend Nusrat Jahan',
      mBtn: mode === 'addr' ? 'Save address' : mode === 'coupon' ? 'Assign coupon' : mode === 'credit' ? 'Add ' + bdt(s.cAmt || 200) : mode === 'points' ? ((s.pOp || 'give') === 'give' ? 'Give ' : 'Take ') + (s.pAmt || 100) + ' points' : 'Suspend account',
      mBtnCls: mode === 'suspend' ? 'btn warnbtn' : 'btn solid',
      closeM: function () { self.setState({ m: null }); },
      cAmt: bdt(s.cAmt || 200), cdn: function () { self.setState({ cAmt: Math.max(50, (s.cAmt || 200) - 50) }); }, cup: function () { self.setState({ cAmt: (s.cAmt || 200) + 50 }); },
      pAmt: s.pAmt || 100, pdn: function () { self.setState({ pAmt: Math.max(10, (s.pAmt || 100) - 10) }); }, pup: function () { self.setState({ pAmt: (s.pAmt || 100) + 10 }); },
      pOps: [['give', 'Give'], ['take', 'Take']].map(function (o) { var on = o[0] === (s.pOp || 'give'); return { l: o[1], on: on, bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ pOp: o[0] }); } }; }),
      susReason: s.susReason || 'Too many returned orders', setSusReason: function (e) { self.setState({ susReason: e.target.value }); },
      confirmM: function () {
        if (mode === 'addr') {
          var lbl = s.newLbl || 'Other', line = (s.newLine || '').trim() || 'House 5, Road 12, Uttara Sector 7, Dhaka 1230';
          var id = s.editId || 'a' + (addrs.length + 1) + Date.now() % 1000;
          var na = s.editId ? addrs.map(function (x) { return x.id === id ? assign(assign({}, x), { label: lbl, line: line }) : x; }) : addrs.concat([{ id: id, label: lbl, line: line, who: 'Nusrat Jahan', phone: '01552-3X1-907', used: 'not used yet' }]);
          var p = { m: null, addrs: na }; if (s.newDef) p.defId = id; self.setState(p); toast(self, s.editId ? 'Address updated.' : 'Address added' + (s.newDef ? ' and set as default.' : '.'));
        } else if (mode === 'coupon') { self.setState({ m: null }); toast(self, 'One-time code NUSV10 assigned and sent on WhatsApp.'); }
        else if (mode === 'credit') { self.setState({ m: null, credit: credit + (s.cAmt || 200) }); toast(self, bdt(s.cAmt || 200) + ' added to her wallet.'); }
        else if (mode === 'points') { var d = ((s.pOp || 'give') === 'give' ? 1 : -1) * (s.pAmt || 100); self.setState({ m: null, pts: Math.max(0, pts + d) }); toast(self, (d > 0 ? 'Gave ' : 'Took ') + Math.abs(d) + ' points.'); }
        else { self.setState({ m: null, susp: true }); toast(self, 'Account suspended. She can’t log in or order now.', true); }
      }
    };
    TABS.forEach(function (t) { v['is_' + t[0]] = t[0] === tab; });
    v.dn0 = v.donut[0]; v.dn1 = v.donut[1]; v.dn2 = v.donut[2];
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.snav{flex-wrap:wrap}

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
.ptabs{display:flex;gap:4px;padding:0 20px;border-bottom:1px solid #e6eaf0;overflow-x:auto}
.ptab{position:relative;height:52px;padding:0 14px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:color 200ms}
.ptab:hover{color:#0f172a}
.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.08)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums;letter-spacing:0}
.hbtn{height:36px;padding:0 14px;border-radius:var(--radius-lg);border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:background-color 200ms,border-color 200ms}
.hbtn,.hbtn:hover{text-decoration:none;color:#fff}
.hbtn:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.36)}
.hbtn.pri{background:#ffffff;color:#012169;border-color:#ffffff;font-weight:var(--weight-medium)}.hbtn.pri:hover{background:#e0f3fb}
.hbtn:focus-visible,.ptab:focus-visible,.abtn:focus-visible{outline:3px solid rgba(0,156,222,.6);outline-offset:2px}
.addr{border:1px solid #e6eaf0;border-radius:var(--radius-xl);padding:14px;display:flex;flex-direction:column;gap:6px;transition:border-color 200ms,box-shadow 200ms}
.addr:hover{border-color:#cbd5e1}
.addr.def{border-color:#003087;background:linear-gradient(180deg,#f7f9fd,#ffffff);box-shadow:0 0 0 3px rgba(0,48,135,.06)}
.abtn{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.snav{display:flex;gap:4px;padding:6px;border-radius:var(--radius-xl);background:#ffffff;border:1px solid #e6eaf0;box-shadow:0 8px 24px -16px rgba(15,23,42,.18)}
.sbtn{height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.sbtn:hover{background:#f1f5f9;color:#0f172a}
.sbtn.on{background:#0b1733;color:#fff}
.sbtn .pcnt{background:#eef2f6}.sbtn.on .pcnt{background:rgba(255,255,255,.16);color:#fff}
.sbtn:focus-visible{outline:3px solid rgba(0,156,222,.6);outline-offset:2px}
.bento{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px}
.tile{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);padding:20px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 30px -18px rgba(15,23,42,.12);display:flex;flex-direction:column;gap:14px;min-width:0}
.tt{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:#0f172a;letter-spacing:0}
.ts{font-size:var(--text-xs);color:var(--text-muted)}
.tkt{position:relative;display:flex;border-radius:var(--radius-xl);overflow:hidden;border:1px solid #e6eaf0;background:#fff}
.tkt::before,.tkt::after{content:"";position:absolute;left:84px;width:14px;height:14px;border-radius:var(--radius-full);background:#f6f8fb;border:1px solid #e6eaf0}
.tkt::before{top:-8px}.tkt::after{bottom:-8px}
`;

// ---- markup ----

export default class CustomerCRMScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="CustomerCRM">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main" style={{ position: "relative", flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Customers / All customers" page="Customer profile" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Customer profile" />
              <section style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-xl)", background: "radial-gradient(1200px 300px at 85% -40%, rgba(0,156,222,.22), transparent 60%), radial-gradient(600px 240px at 0% 120%, rgba(10,91,208,.3), transparent 60%), linear-gradient(135deg, #0b1733 0%, var(--primary-900) 45%, var(--primary-800) 100%)", color: "var(--text-on-dark)", boxShadow: "0 20px 40px -20px rgba(1,33,105,.55)" }}>
                <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: "0", opacity: ".07" }}>
                  <defs>
                    <pattern id="gcgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M28 0H0V28" fill="none" stroke="#ffffff" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gcgrid)" />
                </svg>
                <div style={{ position: "relative", padding: "28px 30px 22px", display: "flex", gap: "22px", alignItems: "flex-start" }}>
                  <div style={{ position: "relative", flexShrink: "0" }}>
                    <span style={{ width: "84px", height: "84px", borderRadius: "var(--radius-full)", padding: "3px", background: "conic-gradient(from 200deg, #f5c86b, #a16207, #f5c86b)", display: "block" }}>
                      <span style={{ width: "100%", height: "100%", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#012169", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #0b1733" }}>{v.profInitial}</span>
                    </span>
                    <span role="img" aria-label="Online now" title="Online now" style={{ position: "absolute", right: "4px", bottom: "6px", width: "14px", height: "14px", borderRadius: "var(--radius-full)", background: "#22c55e", border: "3px solid #012169" }} />
                  </div>
                  <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--text-on-dark)" }}>{v.profName}</h2>
                      <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "linear-gradient(90deg, #f5c86b, #d69e2e)", color: "#3b2503", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", display: "inline-flex", alignItems: "center", gap: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
  <path d="M5 21h14" />
</svg> GOLD</span>
                      <span style={__sx(`height: 24px; padding: 0 10px; border-radius: var(--radius-full); background: ${v.stHeroBg ?? ""}; color: ${v.stHeroFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; gap: 6px;`)}><span style={{ width: "6px", height: "6px", borderRadius: "var(--radius-full)", background: "currentColor" }} />{v.stTxt}</span>
                      {__list(v.tags).map((tg, $index) => (<React.Fragment key={$index}>
                          <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,255,255,.45)", color: "var(--text-on-dark)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{tg?.t}</span>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", fontSize: "var(--text-xs-plus)", color: "var(--text-on-dark-muted)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                          <path d="M12 18h.01" />
                        </svg>
                        <span className="mono">{v.profPhone}</span>
                        <span style={{ color: "#7dd3fc" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="20" height="16" x="2" y="4" rx="2" />
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
</svg> nusrat.jahan@example.com</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
  <circle cx="12" cy="10" r="3" />
</svg> {v.profArea}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Buys: {v.profTypes}</span>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>Customer since 2 Mar 2026 · came from Facebook ad “Eid skin care” · ID C-10482 · looked after by Tania</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: "0", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}>
                    {v.profWhole ? (
                      <__Link href={v.profWholeHref} className="hbtn"><__Icon name="store" width="16" height="16" aria-hidden="true" /><span>Wholesale profile</span></__Link>
                    ) : null}
                    <button type="button" className="hbtn" onClick={v.openEditProf} aria-haspopup="dialog">
                      <__Icon name="pencil" width="16" height="16" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button type="button" className="hbtn" onClick={v.call}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Call</span>
                    </button>
                    <button type="button" className="hbtn" onClick={v.openCoupon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M9 9h.01" />
                        <path d="m15 9-6 6" />
                        <path d="M15 15h.01" />
                      </svg>
                      <span>Coupon</span>
                    </button>
                    <button type="button" className="hbtn" onClick={v.openCredit}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                      <span>Credit</span>
                    </button>
                    <button type="button" className="hbtn pri" onClick={v.openSms}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                        <path d="m21.854 2.147-10.94 10.939" />
                      </svg>
                      <span>Message</span>
                    </button>
                  </div>
                </div>
                <div style={{ position: "relative", display: "flex", padding: "18px 8px 22px", margin: "0 22px", borderTop: "1px solid rgba(255,255,255,.12)" }}>
                  <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Lifetime value</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>৳58,200</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>since Mar 2026</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Orders</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>14</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>12 delivered · 1 returned</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Average order</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>৳4,157</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>top 15% of buyers</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Loyalty points</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>{v.pts}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>= {v.ptsTk} off</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Wallet credit</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>{v.credit}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>refunds and rewards</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Coupons</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>6 / 9</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>used / received</span>
                  </div>
                  <div style={{ padding: "0 22px", borderLeft: "1px solid rgba(255,255,255,.14)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-on-dark-muted)" }}>Last login</span>
                    <span className="num" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#ffffff" }}>Today</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-on-dark-muted)" }}>10:42 AM · Android</span>
                  </div>
                </div>
              </section>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <nav className="snav" aria-label="Customer sections">
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.scls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </nav>
                {v.hasMsg ? (<>
                  <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.msg}</span>
                  </div>
                </>) : null}
                {v.is_overview ? (<>
                  <div className="fade">
                    <div className="bento">
                      <section className="tile" style={{ gridColumn: "span 8" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Spending</div>
                            <div className="ts">Last 12 months · ৳58,200 total</div>
                          </div>
                          <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                            {__list(v.rng).map((r, $index) => (<React.Fragment key={$index}>
                                <button type="button" aria-pressed={r?.on} onClick={r?.pick} style={__sx(`height: 28px; padding: 0 12px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs); font-weight: var(--weight-medium); cursor: pointer; background: ${r?.bg ?? ""}; color: ${r?.fg ?? ""};`)}>{r?.l}</button>
                              </React.Fragment>))}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "190px", paddingTop: "8px", borderBottom: "1px solid #eef2f6" }}>
                          {__list(v.bars).map((b, $index) => (<React.Fragment key={$index}>
                              <div style={{ flex: "1 1 0", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                                <span className="num" style={__sx(`font-size: var(--text-2xs); color: var(--text-muted); opacity: ${b?.lop ?? ""};`)}>{b?.v}</span>
                                <div title={b?.tip} style={__sx(`width: 100%; max-width: 34px; height: ${b?.h ?? ""}; border-radius: var(--radius-lg) var(--radius-lg) 3px 3px; background: ${b?.bg ?? ""};`)} />
                              </div>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "-6px" }}>
                          {__list(v.bars).map((b, $index) => (<React.Fragment key={$index}>
                              <span style={{ flex: "1 1 0", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{b?.m}</span>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 4" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Road to Platinum</div>
                            <div className="ts">Buy ৳91,800 more to unlock 2× points</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: "180px" }}>
                          <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
                            <circle cx="90" cy="90" r="74" fill="none" stroke="#eef2f6" strokeWidth="14" />
                            <circle cx="90" cy="90" r="74" fill="none" stroke="url(#gold)" strokeWidth="14" strokeLinecap="round" strokeDasharray={v.ringDash} transform="rotate(-90 90 90)" />
                            <defs>
                              <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#f5c86b" />
                                <stop offset="1" stopColor="#a16207" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div style={{ position: "absolute", textAlign: "center" }}>
                            <div className="num" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>39%</div>
                            <div className="ts">৳58,200 of ৳1,50,000</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                          <span style={{ color: "#a16207", fontWeight: "var(--weight-medium)" }}>GOLD · 1.5× points</span>
                          <span style={{ color: "#003087", fontWeight: "var(--weight-medium)" }}>PLATINUM · 2×</span>
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 4", background: "radial-gradient(400px 200px at 100% 0%, rgba(0,156,222,.18), transparent 60%), linear-gradient(160deg, #0b1733, var(--primary-900))", color: "var(--text-on-dark)", border: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                            </svg>
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-label)", fontWeight: "var(--weight-medium)", color: "var(--text-on-dark-muted)" }}>NEXT BEST ACTION</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xl)", lineHeight: "26px", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--text-on-dark)" }}>Send 10% off Vitamin C Serum</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "var(--text-on-dark-muted)" }}>She looked at it 4 times and left a ৳3,240 cart this morning. Customers like her come back 38% of the time with a small code.</div>
                        <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
                          {v.nbaOpen ? (<>
                            <button type="button" className="hbtn pri" onClick={v.sendNba}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                              </svg>
                              <span>Send on WhatsApp</span>
                            </button>
                            <button type="button" className="hbtn" onClick={v.skipNba}>Not now</button>
                          </>) : null}
                          {v.nbaDone ? (<>
                            <span style={{ height: "36px", padding: "0 12px", borderRadius: "var(--radius-lg)", background: "rgba(34,197,94,.2)", color: "#bbf7d0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.nbaTxt}</span>
                          </>) : null}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 4" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Order outcomes</div>
                            <div className="ts">14 orders</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                          <div style={{ position: "relative", width: "132px", height: "132px", flexShrink: "0" }}>
                            <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
                              <circle cx="66" cy="66" r="52" fill="none" stroke="#eef2f6" strokeWidth="16" />
                              <circle cx="66" cy="66" r="52" fill="none" stroke={v.dn0?.c} strokeWidth="16" strokeDasharray={v.dn0?.dash} strokeDashoffset={v.dn0?.off} transform="rotate(-90 66 66)" />
                              <circle cx="66" cy="66" r="52" fill="none" stroke={v.dn1?.c} strokeWidth="16" strokeDasharray={v.dn1?.dash} strokeDashoffset={v.dn1?.off} transform="rotate(-90 66 66)" />
                              <circle cx="66" cy="66" r="52" fill="none" stroke={v.dn2?.c} strokeWidth="16" strokeDasharray={v.dn2?.dash} strokeDashoffset={v.dn2?.off} transform="rotate(-90 66 66)" />
                            </svg>
                            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>86%</span>
                              <span className="ts">delivered</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexGrow: "1" }}>
                            {__list(v.donut).map((d, $index) => (<React.Fragment key={$index}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                                  <span style={__sx(`width: 10px; height: 10px; border-radius: 3px; background: ${d?.c ?? ""};`)} />
                                  <span style={{ flexGrow: "1", color: "#334155" }}>{d?.l}</span>
                                  <b className="num">{d?.n}</b>
                                </div>
                              </React.Fragment>))}
                            <div className="ts" style={{ paddingTop: "6px", borderTop: "1px dashed #eef2f6" }}>Return rate 7% · shop average 11%</div>
                          </div>
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 4" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">What she buys</div>
                            <div className="ts">By money spent</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {__list(v.cats).map((ct, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)" }}>
                                  <span style={{ color: "#334155" }}>{ct?.l}</span>
                                  <span className="num" style={{ fontWeight: "var(--weight-medium)" }}>{ct?.v}</span>
                                </div>
                                <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                                  <div style={__sx(`width: ${ct?.w ?? ""}; height: 100%; border-radius: var(--radius-full); background: ${ct?.c ?? ""};`)} />
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 6" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Addresses</div>
                            <div className="ts">{v.addrCount} saved · default is used for new orders</div>
                          </div>
                          <button type="button" className="abtn" onClick={v.openAddr}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add address</button>
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                          {__list(v.addrs).map((ad, $index) => (<React.Fragment key={$index}>
                              <div className={ad?.cls}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={__sx(`width: 28px; height: 28px; border-radius: var(--radius-lg); background: ${ad?.iBg ?? ""}; color: ${ad?.iFg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                  </span>
                                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", flexGrow: "1" }}>{ad?.label}</span>
                                  {ad?.isDef ? (<>
                                    <span style={{ height: "22px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".05em", display: "inline-flex", alignItems: "center" }}>DEFAULT</span>
                                  </>) : null}
                                </div>
                                <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#334155" }}>{ad?.line}</div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ad?.who} · <span className="mono">{ad?.phone}</span> · {ad?.used}</div>
                                <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                                  {ad?.notDef ? (<>
                                    <button type="button" className="abtn" onClick={ad?.makeDef}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
</svg>Make default</button>
                                  </>) : null}
                                  <button type="button" className="abtn" onClick={ad?.edit}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 20h9" />
  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
</svg>Edit</button>
                                  {ad?.notDef ? (<>
                                    <button type="button" className="abtn" onClick={ad?.remove} aria-label={`Remove ${ad?.label ?? ""}`}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                                      </svg>
                                    </button>
                                  </>) : null}
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 6" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Coupon wallet</div>
                            <div className="ts">2 ready to use · 6 used · saved ৳2,340 so far</div>
                          </div>
                          <button type="button" className="abtn" onClick={v.openCoupon}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Assign coupon</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {__list(v.wcoupons).map((wc, $index) => (<React.Fragment key={$index}>
                              <div className="tkt" style={__sx(`opacity: ${wc?.op ?? ""};`)}>
                                <div style={__sx(`width: 92px; flex-shrink: 0; background: ${wc?.bg ?? ""}; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-right: 2px dashed rgba(255,255,255,.5);`)}>
                                  <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", lineHeight: "23px", textAlign: "center" }}>{wc?.big}</span>
                                </div>
                                <div style={{ flexGrow: "1", minWidth: "0", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span className="mono" style={{ fontWeight: "var(--weight-semibold)", color: "#003087" }}>{wc?.code}</span>
                                    <span className={wc?.cls}>{wc?.st}</span>
                                  </div>
                                  <div style={{ fontSize: "var(--text-xs-plus)", color: "#334155" }}>{wc?.gives}</div>
                                  <div className="ts">{wc?.from} · {wc?.note}</div>
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 8" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Timeline</div>
                            <div className="ts">Everything she did, newest first</div>
                          </div>
                          <button type="button" className="abtn" onClick={v.goAll}>See full history</button>
                        </div>
                        <div>
                          {__list(v.tl).map((e, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "grid", gridTemplateColumns: "92px 36px 1fr", gap: "12px" }}>
                                <span className="ts" style={{ textAlign: "right", paddingTop: "8px" }}>{e?.when}</span>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span style={__sx(`width: 34px; height: 34px; border-radius: var(--radius-lg); background: ${e?.bg ?? ""}; color: ${e?.fg ?? ""}; font-size: var(--text-2xs); font-weight: var(--weight-medium); display: flex; align-items: center; justify-content: center;`)}>{e?.tag}</span>
                                  <span style={{ flexGrow: "1", width: "2px", background: "#eef2f6", minHeight: "14px" }} />
                                </div>
                                <div style={{ padding: "6px 0 16px" }}>
                                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{e?.what}</div>
                                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{e?.sub}</div>
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 4" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Quick controls</div>
                            <div className="ts">Changes save straight away</div>
                          </div>
                        </div>
                        <div className="psec">Payment methods</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>Cash on delivery</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.pCod?.c ?? ""};`)}>{v.pCod?.t}</span>
                          <button type="button" role="switch" aria-checked={v.pCod?.on} aria-label="Cash on delivery" className={v.pCod?.cls} onClick={v.pCod?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>bKash</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.pBkash?.c ?? ""};`)}>{v.pBkash?.t}</span>
                          <button type="button" role="switch" aria-checked={v.pBkash?.on} aria-label="bKash" className={v.pBkash?.cls} onClick={v.pBkash?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>Nagad</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.pNagad?.c ?? ""};`)}>{v.pNagad?.t}</span>
                          <button type="button" role="switch" aria-checked={v.pNagad?.on} aria-label="Nagad" className={v.pNagad?.cls} onClick={v.pNagad?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>Card</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.pCard?.c ?? ""};`)}>{v.pCard?.t}</span>
                          <button type="button" role="switch" aria-checked={v.pCard?.on} aria-label="Card" className={v.pCard?.cls} onClick={v.pCard?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>Wallet</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.pWallet?.c ?? ""};`)}>{v.pWallet?.t}</span>
                          <button type="button" role="switch" aria-checked={v.pWallet?.on} aria-label="Wallet" className={v.pWallet?.cls} onClick={v.pWallet?.toggle} />
                        </div>
                        <div className="psec" style={{ marginTop: "6px" }}>Offers by</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>SMS</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.cSms?.c ?? ""};`)}>{v.cSms?.t}</span>
                          <button type="button" role="switch" aria-checked={v.cSms?.on} aria-label="SMS" className={v.cSms?.cls} onClick={v.cSms?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>WhatsApp</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.cWa?.c ?? ""};`)}>{v.cWa?.t}</span>
                          <button type="button" role="switch" aria-checked={v.cWa?.on} aria-label="WhatsApp" className={v.cWa?.cls} onClick={v.cWa?.toggle} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#0f172a" }}>Email</span>
                          <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${v.cEmail?.c ?? ""};`)}>{v.cEmail?.t}</span>
                          <button type="button" role="switch" aria-checked={v.cEmail?.on} aria-label="Email" className={v.cEmail?.cls} onClick={v.cEmail?.toggle} />
                        </div>
                      </section>
                    </div>
                  </div>
                </>) : null}
                {v.is_orders ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div className="gc-table-wrap">
                        <table style={{ width: "100%%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th className="th">Order</th>
                              <th className="th">Date</th>
                              <th className="th">Items</th>
                              <th className="th">Paid by</th>
                              <th className="th">Coupon</th>
                              <th className="th" style={{ textAlign: "right" }}>Amount</th>
                              <th className="th">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.orders).map((o, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td className="td">
                                    <__Link href="/order-detail" className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{o?.no}</__Link>
                                  </td>
                                  <td className="td" style={{ color: "var(--text-muted)" }}>{o?.date}</td>
                                  <td className="td">{o?.items}</td>
                                  <td className="td">{o?.pay}</td>
                                  <td className="td mono" style={{ color: "#047857" }}>{o?.coupon}</td>
                                  <td className="td" style={{ textAlign: "right", fontWeight: "var(--weight-medium)" }}>{o?.amt}</td>
                                  <td className="td">
                                    <span className={o?.cls}>{o?.st}</span>
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", gap: "24px", padding: "14px 16px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                        <span>Total paid <b style={{ color: "#0f172a" }}>৳58,200</b></span>
                        <span>Refunded <b style={{ color: "#b83210" }}>৳650</b></span>
                        <span>Cancelled <b>৳1,240</b></span>
                        <span>Favourite payment <b>bKash</b></span>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_tickets ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {__list(v.tickets).map((t, $index) => (<React.Fragment key={$index}>
                            <__Link href="/support-tickets" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit" }}>
                              <span className="mono" style={{ fontWeight: "var(--weight-medium)", color: "#003087" }}>{t?.no}</span>
                              <span style={{ flexGrow: "1" }}>
                                <span style={{ display: "block", fontWeight: "var(--weight-medium)" }}>{t?.title}</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t?.sub}</span>
                              </span>
                              <span className={t?.cls}>{t?.st}</span>
                            </__Link>
                          </React.Fragment>))}
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_carts ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div className="gc-cols-2" style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span className="lbl" style={{ flexGrow: "1" }}>Abandoned cart · left today 10:45 AM</span>
                            <span style={{ fontWeight: "var(--weight-semibold)" }}>৳3,240</span>
                          </div>
                          {__list(v.cart).map((i, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc" }}>
                                <span style={__sx(`width: 44px; height: 44px; border-radius: var(--radius-lg); background: ${i?.bg ?? ""}; color: #003087; font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center;`)}>{i?.initial}</span>
                                <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{i?.name}<br /><span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Qty {i?.qty}</span></span>
                                <b>{i?.price}</b>
                              </div>
                            </React.Fragment>))}
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Reminder 1 sent on WhatsApp at 11:45 AM · opened</div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" className="btn line sm" onClick={v.remindCart}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                              </svg>
                              <span>Send reminder now</span>
                            </button>
                            <button type="button" className="btn line sm" onClick={v.openCoupon}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                <path d="M9 9h.01" />
                                <path d="m15 9-6 6" />
                                <path d="M15 15h.01" />
                              </svg>
                              <span>Give a cart coupon</span>
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <span className="lbl">Favourites · 4 items</span>
                          <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            {__list(v.favs).map((f, $index) => (<React.Fragment key={$index}>
                                <div style={{ padding: "10px", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0" }}>
                                  <div style={__sx(`height: 70px; border-radius: var(--radius-lg); background: ${f?.bg ?? ""}; display: flex; align-items: center; justify-content: center; color: #003087; font-size: var(--text-xl); font-weight: var(--weight-semibold);`)}>{f?.initial}</div>
                                  <div style={{ fontSize: "var(--text-xs-plus)", marginTop: "6px" }}>{f?.name}</div>
                                  <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>{f?.price} <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${f?.nc ?? ""};`)}>{f?.note}</span></div>
                                </div>
                              </React.Fragment>))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_search ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div className="gc-cols-2" style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="lbl">Searches</span>
                          {__list(v.searches).map((q, $index) => (<React.Fragment key={$index}>
                              <div style={__sx(`display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-lg); background: ${q?.bg ?? ""};`)}>
                                <span style={{ color: "var(--text-muted)" }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                  </svg>
                                </span>
                                <span className="bn" style={{ flexGrow: "1" }}>{q?.q}</span>
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{q?.when}</span>
                                <span style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${q?.fg ?? ""}; min-width: 90px; text-align: right;`)}>{q?.res}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="lbl">Recently viewed</span>
                          {__list(v.viewed).map((vw, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0" }}>
                                <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{vw?.name}</span>
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{vw?.times}</span>
                                <span className={vw?.cls}>{vw?.tag}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_rewards ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="button" className="btn line sm" onClick={v.openCoupon}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                              <path d="M9 9h.01" />
                              <path d="m15 9-6 6" />
                              <path d="M15 15h.01" />
                            </svg>
                            <span>Assign coupon</span>
                          </button>
                          <button type="button" className="btn line sm" onClick={v.openPoints}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                            </svg>
                            <span>Give or take points</span>
                          </button>
                          <button type="button" className="btn line sm" onClick={v.openCredit}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                            </svg>
                            <span>Add credit</span>
                          </button>
                        </div>
                        <div className="gc-table-wrap">
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th className="th">Coupon</th>
                                <th className="th">What it gives</th>
                                <th className="th">Got from</th>
                                <th className="th">Got on</th>
                                <th className="th">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {__list(v.coupons).map((cp, $index) => (<React.Fragment key={$index}>
                                  <tr className="row">
                                    <td className="td">
                                      <span className="mono" style={{ padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1.5px dashed #003087", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{cp?.code}</span>
                                    </td>
                                    <td className="td">{cp?.gives}</td>
                                    <td className="td" style={{ color: "#475569" }}>{cp?.from}</td>
                                    <td className="td" style={{ color: "var(--text-muted)" }}>{cp?.got}</td>
                                    <td className="td">
                                      <span className={cp?.cls}>{cp?.st}</span>
                                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{cp?.note}</div>
                                    </td>
                                  </tr>
                                </React.Fragment>))}
                            </tbody>
                          </table>
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div style={{ padding: "16px", borderRadius: "var(--radius-xl)", background: "#f2f6fc" }}>
                            <div className="lbl">Loyalty points</div>
                            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.pts}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Earned 2,105 · used 260 · 400 expire on 30 Sep</div>
                          </div>
                          <div style={{ padding: "16px", borderRadius: "var(--radius-xl)", background: "#e7f8f1" }}>
                            <div className="lbl">Reward and wallet credit</div>
                            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.credit}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "#475569" }}>Refunds ৳650 · referral rewards ৳600 · added by staff {v.staffCredit}</div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_messages ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6", alignSelf: "flex-start" }}>
                            {__list(v.mTabs).map((m, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={m?.pick} aria-pressed={m?.on} style={__sx(`height: 32px; padding: 0 14px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.l}</button>
                              </React.Fragment>))}
                          </div>
                          {v.isEmailM ? (<>
                            <input className="inp" value={v.mSubj} onInput={v.typeSubj} onChange={v.typeSubj} aria-label="Email subject" placeholder="Subject" />
                          </>) : null}
                          <textarea className="inp bn" rows={v.mRows} value={v.mBody} onInput={v.typeBody} onChange={v.typeBody} aria-label="Message" style={{ height: "auto", padding: "12px 14px", lineHeight: "22px", resize: "vertical" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Insert:</span>
                            {__list(v.mVars).map((v, $index) => (<React.Fragment key={$index}>
                                <button type="button" onClick={v?.pick} className="mono" style={{ height: "28px", padding: "0 10px", borderRadius: "var(--radius-md)", border: "1px dashed #94a3b8", background: "#fff", fontSize: "var(--text-xs)", color: "#003087", cursor: "pointer" }}>{v?.t}</button>
                              </React.Fragment>))}
                            <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.mCount}</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" className="btn solid" onClick={v.sendMsg}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                                <path d="m21.854 2.147-10.94 10.939" />
                              </svg>
                              <span>{v.sendLabel}</span>
                            </button>
                            <button type="button" className="btn line">Save as template</button>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="lbl">Message history</span>
                          {__list(v.history).map((h, $index) => (<React.Fragment key={$index}>
                              <div style={__sx(`padding: 10px 12px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; background: ${h?.bg ?? ""};`)}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={__sx(`height: 22px; padding: 0 8px; border-radius: var(--radius-md); background: ${h?.cBg ?? ""}; color: ${h?.cFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center;`)}>{h?.ch}</span>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", flexGrow: "1" }}>{h?.when} · {h?.by}</span>
                                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>{h?.st}</span>
                                </div>
                                <div className="bn" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "19px" }}>{h?.text}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_security ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                          <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last login</div>
                            <div style={{ fontWeight: "var(--weight-semibold)" }}>19 Sep 2026, 10:42 AM</div>
                          </div>
                          <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Last login IP</div>
                            <div className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>103.112.54.21</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Mirpur, Dhaka · Grameenphone</div>
                          </div>
                          <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sign-up IP</div>
                            <div className="mono" style={{ fontWeight: "var(--weight-semibold)" }}>103.87.214.9</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2 Mar 2026 · Dhaka</div>
                          </div>
                          <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#e7f8f1" }}>
                            <div style={{ fontSize: "var(--text-xs)", color: "#065f46" }}>Risk check</div>
                            <div style={{ fontWeight: "var(--weight-semibold)", color: "#065f46" }}>No risk</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "#065f46" }}>1 return in 14 orders</div>
                          </div>
                        </div>
                        <div className="gc-table-wrap">
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th className="th">IP address</th>
                                <th className="th">Area (approx.)</th>
                                <th className="th">Network</th>
                                <th className="th">Device</th>
                                <th className="th">First seen</th>
                                <th className="th">Last seen</th>
                                <th className="th" style={{ textAlign: "right" }}>Logins</th>
                              </tr>
                            </thead>
                            <tbody>
                              {__list(v.ips).map((p, $index) => (<React.Fragment key={$index}>
                                  <tr className="row">
                                    <td className="td mono" style={{ fontWeight: "var(--weight-medium)" }}>{p?.ip}</td>
                                    <td className="td">{p?.area}</td>
                                    <td className="td" style={{ color: "#475569" }}>{p?.net}</td>
                                    <td className="td" style={{ color: "#475569" }}>{p?.dev}</td>
                                    <td className="td" style={{ color: "var(--text-muted)" }}>{p?.first}</td>
                                    <td className="td" style={{ color: "var(--text-muted)" }}>{p?.last}</td>
                                    <td className="td" style={{ textAlign: "right" }}>{p?.n}</td>
                                  </tr>
                                </React.Fragment>))}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="button" className="btn line sm" onClick={v.logoutAll}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Log out of all devices</span>
                          </button>
                          <button type="button" className="btn line sm" onClick={v.resetPw}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                              <path d="M21 3v5h-5" />
                              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                              <path d="M8 16H3v5" />
                            </svg>
                            <span>Send password reset</span>
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_notes ? (<>
                  <div className="fade">
                    <section className="tile" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp" value={v.noteTxt} onInput={v.typeNote} onChange={v.typeNote} placeholder="Write a note for your team — the customer never sees it" aria-label="New note" />
                          <button type="button" className="btn solid" onClick={v.addNote}>Add note</button>
                        </div>
                        {__list(v.notes).map((n, $index) => (<React.Fragment key={$index}>
                            <div className={n?.cls} style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fffaf0", border: "1px solid #f6d59a" }}>
                              <div style={{ fontSize: "var(--text-sm)", lineHeight: "21px" }}>{n?.t}</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>{n?.by}</div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_settings ? (<>
                  <div className="fade">
                    <div className="bento">
                      <section className="tile" style={{ gridColumn: "span 6" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">About</div>
                            <div className="ts">Customer details</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Phone</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}><span className="mono">01552-3X1-907</span> · verified</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Email</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>nusrat.jahan@example.com</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Birthday</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>14 Nov</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Customer since</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>2 Mar 2026</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Came from</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>Facebook ad “Eid skin care”</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Likes messages by</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>WhatsApp</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "var(--text-xs-plus)", padding: "7px 0", borderBottom: "1px dashed #eef2f6" }}>
                          <span style={{ color: "var(--text-muted)" }}>Customer ID</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#0f172a", textAlign: "right" }}>
                            <span className="mono">C-10482</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ flexGrow: "1", color: "var(--text-muted)" }}>Looked after by</span>
                          <select className="inp" aria-label="Assigned staff" style={{ width: "190px", height: "36px" }}>
                            <option>Tania (support)</option>
                            <option>Karim (sales)</option>
                            <option>Shanto (owner)</option>
                          </select>
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 6" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Tags</div>
                            <div className="ts">Used in filters and customer groups</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {__list(v.tagChips).map((c, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "36px" }}>{c?.label}</button>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="tt">Limits</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ flexGrow: "1", color: "#334155" }}>Max cash-on-delivery order</span>
                          <select className="inp" aria-label="Max COD order" style={{ width: "140px", height: "36px" }}>
                            <option>No limit</option>
                            <option>৳3,000</option>
                            <option>৳5,000</option>
                            <option>৳10,000</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                          <span style={{ flexGrow: "1", color: "#334155" }}>Ask for advance payment above</span>
                          <select className="inp" aria-label="Advance payment" style={{ width: "140px", height: "36px" }}>
                            <option>Never</option>
                            <option>৳5,000</option>
                            <option>৳10,000</option>
                          </select>
                        </div>
                      </section>
                      <section className="tile" style={{ gridColumn: "span 12", borderColor: "#f5d0c5", flexDirection: "row", alignItems: "center", gap: "16px" }}>
                        <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m4.9 4.9 14.2 14.2" />
                          </svg>
                        </span>
                        <div style={{ flexGrow: "1" }}>
                          <div className="tt">{v.acctTitle}</div>
                          <div className="ts">{v.acctSub}</div>
                        </div>
                        {v.isActive ? (<>
                          <button type="button" className="btn line" onClick={v.openSuspend} style={{ color: "#b83210", borderColor: "#f5b5a3" }}>Suspend customer</button>
                        </>) : null}
                        {v.isSusp ? (<>
                          <button type="button" className="btn line" onClick={v.unsuspend}>Turn account back on</button>
                        </>) : null}
                      </section>
                    </div>
                  </div>
                </>) : null}
              </div>
              {v.mOpen ? (<>
                <div style={{ position: "absolute", inset: "0", background: "rgba(15,23,42,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "5" }}>
                  <section className="pcard fade" role="dialog" aria-label={v.mTitle} style={{ width: "560px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.mTitle}</h2>
                      <button type="button" className="ib" aria-label="Close" onClick={v.closeM}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    {v.mCoupon ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Coupon</span>
                          <select className="inp" aria-label="Coupon">
                            <option>Make a one-time code just for her</option>
                            <option>EID300 — ৳300 off on ৳2,000+</option>
                            <option>SKIN15 — 15% off skin care</option>
                            <option>GOLD500 — ৳500 off on ৳5,000+</option>
                          </select>
                        </label>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Discount</span>
                            <select className="inp" aria-label="Discount">
                              <option>10% off, up to ৳300</option>
                              <option>৳100 off</option>
                              <option>৳200 off</option>
                              <option>Free delivery</option>
                            </select>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Works for</span>
                            <select className="inp" aria-label="Valid for">
                              <option>7 days</option>
                              <option>3 days</option>
                              <option>14 days</option>
                              <option>30 days</option>
                            </select>
                          </label>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Tell her by</span>
                          <select className="inp" aria-label="Channel">
                            <option>WhatsApp</option>
                            <option>SMS</option>
                            <option>Email</option>
                            <option>Don’t send a message</option>
                          </select>
                        </label>
                      </div>
                    </>) : null}
                    {v.mCredit ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                            <button type="button" className="ib" aria-label="Less credit amount" onClick={v.cdn} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{v.cAmt}</span>
                            <button type="button" className="ib" aria-label="More credit amount" onClick={v.cup} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </button>
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>goes into her wallet — she can pay with it</span>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Why?</span>
                          <select className="inp" aria-label="Reason">
                            <option>Sorry for a late delivery</option>
                            <option>Refund</option>
                            <option>Gift</option>
                            <option>Fix a mistake</option>
                          </select>
                        </label>
                      </div>
                    </>) : null}
                    {v.mPoints ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6", alignSelf: "flex-start" }}>
                          {__list(v.pOps).map((w, $index) => (<React.Fragment key={$index}>
                              <button type="button" aria-pressed={w?.on} onClick={w?.pick} style={__sx(`height: 32px; padding: 0 14px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${w?.bg ?? ""}; color: ${w?.fg ?? ""};`)}>{w?.l}</button>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                            <button type="button" className="ib" aria-label="Less points" onClick={v.pdn} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{v.pAmt}</span>
                            <button type="button" className="ib" aria-label="More points" onClick={v.pup} style={{ borderRadius: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                            </button>
                          </div>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>points</span>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Why?</span>
                          <input className="inp" placeholder="e.g. Sorry gift" aria-label="Reason" />
                        </label>
                      </div>
                    </>) : null}
                    {v.mSuspend ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Reason</span>
                          <select className="inp" value={v.susReason} onChange={v.setSusReason} aria-label="Reason">
                            <option>Too many returned orders</option>
                            <option>Fake or prank orders</option>
                            <option>Abusive to staff</option>
                            <option>Asked to close the account</option>
                          </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">For how long</span>
                          <select className="inp" aria-label="Duration">
                            <option>Until I turn it back on</option>
                            <option>7 days</option>
                            <option>30 days</option>
                          </select>
                        </label>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#8a2a0c", background: "#ffece6", padding: "10px 12px", borderRadius: "var(--radius-lg)" }}>She will not be able to log in or place orders. Open orders stay as they are.</div>
                      </div>
                    </>) : null}
                    {v.mAddr ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {__list(v.addrLabels).map((al, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={al?.cls} aria-pressed={al?.on} onClick={al?.pick} style={{ height: "36px" }}>{al?.l}</button>
                            </React.Fragment>))}
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Receiver name</span>
                            <input className="inp" defaultValue="Nusrat Jahan" aria-label="Receiver name" />
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Receiver phone</span>
                            <input className="inp mono" defaultValue="01552-3X1-907" aria-label="Receiver phone" />
                          </label>
                        </div>
                        <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Division</span>
                            <select className="inp" aria-label="Division">
                              <option>Dhaka</option>
                              <option>Chattogram</option>
                              <option>Sylhet</option>
                              <option>Khulna</option>
                              <option>Rajshahi</option>
                              <option>Barishal</option>
                              <option>Rangpur</option>
                              <option>Mymensingh</option>
                            </select>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">District</span>
                            <select className="inp" aria-label="District">
                              <option>Dhaka</option>
                              <option>Gazipur</option>
                              <option>Narayanganj</option>
                            </select>
                          </label>
                          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Area</span>
                            <select className="inp" aria-label="Area">
                              <option>Dhanmondi</option>
                              <option>Mirpur</option>
                              <option>Gulshan</option>
                              <option>Uttara</option>
                            </select>
                          </label>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">House, road, landmark</span>
                          <input className="inp" value={v.newLine} onInput={v.typeLine} onChange={v.typeLine} placeholder="e.g. House 5, Road 12, near Rapa Plaza" aria-label="Full address" />
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)" }}><input type="checkbox" checked={v.newDef} onChange={v.toggleNewDef} style={{ width: "18px", height: "18px" }} />Make this the default address</label>
                      </div>
                    </>) : null}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" className="btn line" onClick={v.closeM}>Cancel</button>
                      <button type="button" className={v.mBtnCls} onClick={v.confirmM}>{v.mBtn}</button>
                    </div>
                  </section>
                </div>
              </>) : null}
            </div>
            <CustomerEditDialog open={v.editProfOpen} customer={v.editProf} onSave={v.saveProfile} onClose={v.closeEditProf} />
          </main>
        </div>
      </div>
    );
  }
}
