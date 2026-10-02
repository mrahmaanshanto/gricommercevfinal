'use client';
// Generated from design/templates/customers-crm/CustomerCRM.dc.html by scripts/convert-design.mjs.
// CustomerCRM — one customer's profile, laid out like Shopify's customer page (docs/shopify-style.md, record page):
// RecordHeader (name, level and status, Edit, Call, Message, More actions), the key figures, then the work on the
// left (next best action, orders, activity: timeline, messages, tickets, cart, searches, coupons, logins; spending
// folded) and the facts on the right (contact, addresses, loyalty, tags, notes, controls, account).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, StatusBadge as __StatusBadge, InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV, Menu } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { getDemoEdits, saveDemoEdit } from '@/lib/customerEdits';
import { phoneDigits } from '@/lib/customers';
import { FORM_CSS, Switch, Steps } from '@/screens/loyalty-promo/loyShared';
import CustomerEditDialog from './CustomerEditDialog';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var CHN = { sms: ['SMS'], wa: ['WhatsApp'], email: ['Email'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// success feedback is the shared toast (src/runtime/ui.js); `bad` shows it as an error
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }

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
var OTONE = { Delivered: 'success', Cancelled: 'error', Returned: 'warning' };
var TL = [
  ['CART', 'Left 3 items in her cart', 'Sunscreen SPF 50, Lip Balm, Face Towel · ৳3,240', 'Today, 10:45 AM'],
  ['LOG', 'Logged in', 'Chrome on Android · 103.112.54.21', 'Today, 10:42 AM'],
  ['MSG', 'Cart reminder sent on WhatsApp', 'Opened', 'Today, 11:45 AM'],
  ['ORD', 'Order #GC-10471 delivered', '৳4,860 · bKash · 180 points earned', '12 Sep 2026'],
  ['TIX', 'Ticket #T-2210 solved', 'Asked about delivery time · 14 min', '10 Sep 2026'],
  ['CPN', 'Got coupon SKIN15', 'From “Bought sunscreen, try toner”', '8 Sep 2026'],
  ['RET', 'Returned Aloe Vera Gel', 'Wrong size · refund ৳650 to wallet', '28 Aug 2026']
];
var COUP = [
  ['NUS7Q2', '10% off Vitamin C Serum', 'Smart offer · Looked but didn’t buy', '19 Sep 2026', 'Unused', 'Ends 22 Sep'],
  ['SKIN15', '15% off skin care', 'Offers page', '8 Sep 2026', 'Used', 'On #GC-10471 · saved ৳726'],
  ['EID300', '৳300 off on ৳2,000+', 'Checkout', '20 Aug 2026', 'Used', 'On #GC-10311'],
  ['NUSWB5', '5% off', 'Smart offer · Win them back', '1 Aug 2026', 'Expired', 'Not used'],
  ['FIRST20', '20% off first order', 'Sign-up', '2 Mar 2026', 'Used', 'On #GC-10150'],
  ['SORRY100', '৳100 off', 'Given by Tania', '10 Sep 2026', 'Unused', 'No end date']
];
var CTONE = { Used: 'success', Unused: 'info', Expired: 'neutral' };
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
var TL_ICON = { CART: 'shopping-cart', LOG: 'log-in', MSG: 'message-circle', ORD: 'package-check', TIX: 'life-buoy', CPN: 'ticket-percent', RET: 'undo-2' };
var TAGS = ['VIP', 'Wholesale', 'Influencer', 'Staff', 'Fraud watch', 'Prefers call'];
// The activity card's views; orders, notes and the controls have cards of their own.
var TABS = [['timeline', 'Timeline'], ['messages', 'Messages'], ['tickets', 'Support tickets'], ['carts', 'Cart & favourites'], ['search', 'Searches & views'], ['rewards', 'Coupons & rewards'], ['security', 'Logins & IPs']];
var CNT = { timeline: 7, tickets: 3, carts: 1, search: 6, rewards: 9, messages: 23, security: 4 };
var MDEF = { sms: 'Hi {name}, ', wa: 'Hi {name}, ', email: 'Hi {name},\n\n' };
// This profile shows the demo list customer c01 (Nusrat Jahan); edits made here and on All customers
// are kept in this browser under the same id.
var PROFILE_ID = 'c01';
var PROFILE0 = { name: 'Nusrat Jahan', phone: '01552-3X1-907', address: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', types: ['Online'], tier: 'A', creditLimit: 0 };
function areaOf(address) { var parts = String(address || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); return parts.slice(-2).join(', ').replace(/\s+\d{4}$/, '') || 'No address on file'; }
class Component extends DCLogic {
  componentDidMount() { this.setState({ prof: assign(assign({}, PROFILE0), getDemoEdits()[PROFILE_ID] || {}) }); }
  saveProfile = (vals) => {
    var prev = (this.state || {}).prof || PROFILE0, wasWhole = (prev.types || []).indexOf('Wholesale') >= 0, isWhole = vals.types.indexOf('Wholesale') >= 0;
    var patch = { name: vals.name, phone: vals.phone, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit, due: 0 };
    saveDemoEdit(PROFILE_ID, patch);
    this.setState({ prof: assign(assign({}, prev), patch), editProf: null });
    uiToast(vals.name + ' was updated.' + (isWhole && !wasWhole ? ' They now show under Wholesale customers.' : ''));
  };
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || 'timeline', susp = !!s.susp, pay = s.pay || { pCod: true, pBkash: true, pNagad: true, pCard: true, pWallet: true }, con = s.con || { cSms: true, cWa: true, cEmail: false };
    var pts = s.pts != null ? s.pts : 1845, credit = s.credit != null ? s.credit : 1250, tags = s.tags || { VIP: true };
    var mch = s.mch || 'sms', mb = s.mb || {}, body = mb[mch] != null ? mb[mch] : MDEF[mch];
    var notes = s.notes || [{ t: 'Prefers delivery after 6:00 PM. Call before sending.', by: 'Tania · 10 Sep 2026' }, { t: 'Buys for her sister too — good for bundle offers.', by: 'Shanto · 22 Aug 2026' }];
    var mode = s.m;
    var addrs = s.addrs || ADDR0.map(function (a) { return assign({}, a); }), defId = s.defId || 'a1';
    var ordered = addrs.filter(function (a) { return a.id === defId; }).concat(addrs.filter(function (a) { return a.id !== defId; }));
    var sw = function (store, key, label, onTxt, offTxt, stateKey) { var on = !!store[key]; return { on: on, t: on ? onTxt : offTxt, toggle: function () { var o = assign({}, store); o[key] = !on; var p = {}; p[stateKey] = o; self.setState(p); toast(self, label + (on ? ' blocked for this customer.' : ' allowed again.'), on); } }; };
    var open = function (m) { return function () { self.setState({ m: m, cAmt: 200, pAmt: 100, pOp: 'give' }); }; };
    var bn = /[ঀ-৿]/.test(body), parts = body.length <= (bn ? 70 : 160) ? 1 : Math.ceil(body.length / (bn ? 67 : 153));
    var prof = s.prof || PROFILE0, profWhole = (prof.types || []).indexOf('Wholesale') >= 0;
    var v = {
      profName: prof.name, profPhone: prof.phone, profArea: areaOf(prof.address), profInitial: prof.name.charAt(0).toUpperCase(), profTypes: (prof.types || []).join(' · '),
      profWhole: profWhole, profWholeHref: '/wholesale-customer?phone=' + phoneDigits(prof.phone) + '&demo=' + PROFILE_ID,
      editProfOpen: !!s.editProf, editProf: s.editProf, saveProfile: self.saveProfile, closeEditProf: function () { self.setState({ editProf: null }); },
      openEditProf: function () { self.setState({ editProf: { name: prof.name, phone: prof.phone, address: prof.address, types: prof.types || ['Online'], tier: prof.tier || 'A', creditLimit: prof.creditLimit || 0 } }); },
      rng: [['12m', '12 months'], ['6m', '6 months']].map(function (r) { var on = r[0] === (s.rng || '12m'); return { l: r[1], on: on, pick: function () { self.setState({ rng: r[0] }); } }; }),
      bars: (function () { var M = [['Oct', 0], ['Nov', 1200], ['Dec', 3400], ['Jan', 0], ['Feb', 2100], ['Mar', 5200], ['Apr', 4100], ['May', 6800], ['Jun', 2500], ['Jul', 4600], ['Aug', 11850], ['Sep', 6310]]; if ((s.rng || '12m') === '6m') M = M.slice(6); var mx = 11850; return M.map(function (m, i) { var last = i === M.length - 1; return { m: m[0], v: m[1] ? '৳' + (m[1] >= 1000 ? (m[1] / 1000).toFixed(1) + 'k' : m[1]) : '', h: Math.max(3, Math.round(m[1] / mx * 100)) + '%', last: last, top: m[1] === mx, tip: m[0] + ': ' + bdt(m[1]) }; }); })(),
      donut: [['Delivered', 12, 'var(--success)'], ['Returned', 1, 'var(--warning)'], ['Cancelled', 1, 'var(--error)']].map(function (x) { return { l: x[0], n: x[1], c: x[2], w: Math.round(x[1] / 14 * 100) + '%' }; }),
      cats: [['Skin care', 36400], ['Clothing', 13100], ['Personal care', 6200], ['Grocery', 2500]].map(function (c) { return { l: c[0], v: bdt(c[1]), w: Math.round(c[1] / 36400 * 100) + '%' }; }),
      nbaOpen: !s.nba, nbaDone: !!s.nba, nbaTxt: s.nba === 'sent' ? 'Sent · code NUSV10, 3 days' : 'Skipped for 7 days',
      sendNba: function () { self.setState({ nba: 'sent' }); toast(self, '10% off Vitamin C Serum sent on WhatsApp.'); }, skipNba: function () { self.setState({ nba: 'skip' }); },
      ordAll: !!s.ordAll, toggleOrders: function () { self.setState({ ordAll: !s.ordAll }); },
      acctTitle: susp ? 'Account suspended' : 'Suspend this customer', acctSub: susp ? 'Suspended on 19 Sep 2026 by Shanto — ' + (s.susReason || 'Too many returned orders') + '.' : 'Stops her from logging in and ordering. Open orders are not touched.',
      addrCount: addrs.length,
      addrs: ordered.map(function (a) { var d = a.id === defId; return { id: a.id, label: a.label, line: a.line, who: a.who, phone: a.phone, used: a.used, isDef: d, notDef: !d,
        makeDef: function () { self.setState({ defId: a.id }); toast(self, a.label + ' is now the default address. New orders will use it.'); },
        edit: function () { self.setState({ m: 'addr', editId: a.id, newLbl: a.label, newLine: a.line, newDef: d }); },
        remove: function () { self.setState({ addrs: addrs.filter(function (x) { return x.id !== a.id; }) }); toast(self, a.label + ' address removed.'); } }; }),
      openAddr: function () { self.setState({ m: 'addr', editId: null, newLbl: 'Other', newLine: '', newDef: false }); },
      mAddr: mode === 'addr', newLine: s.newLine || '', typeLine: function (e) { self.setState({ newLine: e.target.value }); },
      newDef: !!s.newDef, toggleNewDef: function () { self.setState({ newDef: !s.newDef }); },
      addrLabels: ALABELS.map(function (l) { var on = l === (s.newLbl || 'Other'); return { l: l, on: on, pick: function () { self.setState({ newLbl: l }); } }; }),
      stTxt: susp ? 'Suspended' : 'Active', stTone: susp ? 'error' : 'success', isActive: !susp, isSusp: susp,
      suspNote: 'Suspended on 19 Sep 2026 by Shanto — ' + (s.susReason || 'Too many returned orders') + '.',
      tags: TAGS.filter(function (t) { return tags[t]; }).map(function (t) { return { t: t }; }),
      tagChips: TAGS.map(function (t) { var on = !!tags[t]; return { label: t, on: on, pick: function () { var o = assign({}, tags); o[t] = !on; self.setState({ tags: o }); } }; }),
      pts: pts.toLocaleString('en-IN'), ptsTk: bdt(pts), credit: bdt(credit), staffCredit: bdt(credit - 1250 + 0 > 0 ? credit - 1250 : 0),
      tabs: TABS.map(function (t) { return { key: t[0], id: 'crm-tab-' + t[0], label: t[1], count: CNT[t[0]], on: t[0] === tab, onClick: function () { self.setState({ tab: t[0] }); } }; }),
      orders: ORDERS.map(function (o) { return { no: o[0], date: o[1], items: o[2], pay: o[3], coupon: o[4], amt: bdt(o[5]), st: o[6], tone: OTONE[o[6]] }; }),
      tickets: [{ no: '#T-2210', title: 'When will my order arrive?', sub: 'WhatsApp · 10 Sep · solved by Tania in 14 min', st: 'Solved', tone: 'success' }, { no: '#T-2104', title: 'Wrong size Aloe Vera Gel', sub: 'Phone · 26 Aug · return approved', st: 'Solved', tone: 'success' }, { no: '#T-2318', title: 'Can I change the delivery address?', sub: 'Messenger · today · waiting for reply', st: 'Open', tone: 'warning' }],
      cart: [['Sunscreen SPF 50 · 50ml', 1, '৳1,250'], ['Lip Balm Strawberry 4g', 2, '৳480'], ['Cotton Face Towel (pack of 3)', 1, '৳1,510']].map(function (i) { return { name: i[0], qty: i[1], price: i[2] }; }),
      favs: [['Night Repair Cream 50g', '৳1,690', 'Price dropped ৳200', 'ly-in'], ['Vitamin C Serum 30ml', '৳1,450', '', ''], ['Travel Pouch Set', '৳650', 'Back in stock', 'ly-in'], ['Silk Scarf · Blue', '৳890', 'Low stock', 'ix-warn']].map(function (f) { return { name: f[0], price: f[1], note: f[2], nc: f[3] }; }),
      searches: [['vitamin c serum', 'Today', '12 found'], ['sunscreen for oily skin', '16 Sep', '8 found'], ['korean snail mucin', '14 Sep', 'Nothing found'], ['সানস্ক্রিন', '10 Sep', '6 found'], ['retinol cream', '2 Sep', 'Nothing found'], ['eid kurti', '20 Aug', '24 found']].map(function (q) { return { q: q[0], when: q[1], res: q[2], none: /Nothing/.test(q[2]) }; }),
      viewed: [['Vitamin C Serum 30ml', '4 times', 'Hot', 'warning'], ['Cotton Kurti · Blue · M', '3 times', 'Hot', 'warning'], ['Hyaluronic Toner 150ml', '2 times', 'Warm', 'info'], ['Night Repair Cream 50g', '1 time', 'Cold', 'neutral']].map(function (x) { return { name: x[0], times: x[1], tag: x[2], tone: x[3] }; }),
      coupons: COUP.map(function (c) { return { code: c[0], gives: c[1], from: c[2], got: c[3], st: c[4], tone: CTONE[c[4]], note: c[5] }; }),
      mTabs: [['sms', 'SMS'], ['wa', 'WhatsApp'], ['email', 'Email']].map(function (m) { var on = m[0] === mch; return { l: m[1], on: on, pick: function () { self.setState({ mch: m[0] }); } }; }),
      isEmailM: mch === 'email', mSubj: s.subj != null ? s.subj : 'A little something for you, Nusrat', typeSubj: function (e) { self.setState({ subj: e.target.value }); },
      mRows: mch === 'email' ? 7 : 4, mBody: body, typeBody: function (e) { var o = assign({}, mb); o[mch] = e.target.value; self.setState({ mb: o }); },
      mVars: ['{name}', '{points}', '{code}', '{link}'].map(function (t) { return { t: t, pick: function () { var o = assign({}, mb); o[mch] = body + t + ' '; self.setState({ mb: o }); } }; }),
      mCount: mch === 'sms' ? body.length + ' letters · ' + parts + ' SMS' : mch === 'wa' ? body.length + ' / 1,000' : 'No limit',
      sendLabel: 'Send ' + (mch === 'sms' ? 'SMS' : mch === 'wa' ? 'WhatsApp' : 'email'),
      sendMsg: function () { var o = assign({}, mb); o[mch] = MDEF[mch]; self.setState({ mb: o, sent: (s.sent || []).concat([{ ch: mch, text: body.replace('{name}', 'Nusrat') }]) }); toast(self, (mch === 'sms' ? 'SMS' : mch === 'wa' ? 'WhatsApp message' : 'Email') + ' sent to Nusrat.'); },
      history: (s.sent || []).slice().reverse().map(function (h) { return ['' + h.ch, 'Just now', 'You', 'Sent', h.text, true]; }).concat(HIST).map(function (h) { return { ch: CHN[h[0]][0], when: h[1], by: h[2], st: h[3], text: h[4], fresh: !!h[5] }; }),
      ips: IPS.map(function (p) { return { ip: p[0], area: p[1], net: p[2], dev: p[3], first: p[4], last: p[5], n: p[6] }; }),
      tl: TL.map(function (e) { return { tag: e[0], icon: TL_ICON[e[0]] || 'circle', what: e[1], sub: e[2], when: e[3] }; }),
      noteTxt: s.nt || '', typeNote: function (e) { self.setState({ nt: e.target.value }); },
      addNote: function () { if (!(s.nt || '').trim()) return; self.setState({ nt: '', notes: [{ t: s.nt, by: 'You · just now', fresh: true }].concat(notes) }); },
      notes: notes.map(function (n) { return { t: n.t, by: n.by }; }),
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
      mDanger: mode === 'suspend',
      closeM: function () { self.setState({ m: null }); },
      cAmt: bdt(s.cAmt || 200), cdn: function () { self.setState({ cAmt: Math.max(50, (s.cAmt || 200) - 50) }); }, cup: function () { self.setState({ cAmt: (s.cAmt || 200) + 50 }); },
      pAmt: s.pAmt || 100, pdn: function () { self.setState({ pAmt: Math.max(10, (s.pAmt || 100) - 10) }); }, pup: function () { self.setState({ pAmt: (s.pAmt || 100) + 10 }); },
      pOps: [['give', 'Give'], ['take', 'Take']].map(function (o) { var on = o[0] === (s.pOp || 'give'); return { l: o[1], on: on, pick: function () { self.setState({ pOp: o[0] }); } }; }),
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
    return v;
  }
}

// ---- styles ----

const CSS = `
.crm-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.crm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.crm-nba{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.crm-nba>svg{flex:none;color:var(--primary)}
.crm-nba>div{flex:1 1 260px;min-width:0}
.crm-nba b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.crm-nba__acts{display:flex;gap:var(--space-2)}
.crm-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.crm-list>li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.crm-list>li:first-child{border-top:0;padding-top:0}
.crm-list>li>div{flex:1;min-width:0}
.crm-list b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-list .crm-when{flex:none;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.crm-ic{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.crm-pane{padding:var(--space-3) var(--space-4) var(--space-4)}
.crm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.crm-two h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.crm-msg{display:flex;flex-direction:column;gap:var(--space-2)}
.crm-vars{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.crm-vars button{height:24px;padding:0 8px;border:1px dashed var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.crm-vars span:last-child{margin-left:auto}
.crm-hist{display:flex;flex-direction:column;gap:var(--space-2)}
.crm-hist>div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.crm-hist>div.is-new{background:var(--fill-primary-soft)}
.crm-hist small{display:flex;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.crm-hist small b{font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-hist small span:last-child{margin-left:auto;color:var(--text-success)}
.crm-bn{font-family:var(--font-bn);font-size:var(--text-xs-plus);line-height:1.5}
.crm-bars{display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.crm-bars>div{display:flex;flex:1 1 0;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.crm-bars i{display:block;width:100%;max-width:28px;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:var(--primary-200)}
.crm-bars i.is-last{background:var(--primary)}
.crm-bars i.is-top{background:var(--warning)}
.crm-months{display:flex;gap:6px}
.crm-months span{flex:1 1 0;font-size:var(--text-2xs);color:var(--text-muted);text-align:center}
.crm-meter{display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-body)}
.crm-meter>div{display:flex;justify-content:space-between;gap:var(--space-2)}
.crm-meter .gc-progress{height:6px}
.crm-addr{display:flex;flex-direction:column;gap:2px;font-size:var(--text-xs-plus);color:var(--text-body)}
.crm-addr>span:first-child{display:flex;align-items:center;gap:6px}
.crm-addr b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-set-h{margin:var(--space-1) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.crm-sel{width:150px}
.crm-danger{color:var(--text-danger)}
.crm-dialog{display:flex;flex-direction:column;gap:var(--space-3)}
.crm-box{border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
@media (max-width:760px){.crm-two{grid-template-columns:minmax(0,1fr)}}
`;

// ---- markup ----

const SWITCHES = [['pCod', 'Cash on delivery'], ['pBkash', 'bKash'], ['pNagad', 'Nagad'], ['pCard', 'Card'], ['pWallet', 'Wallet']];
const OFFERS = [['cSms', 'SMS'], ['cWa', 'WhatsApp'], ['cEmail', 'Email']];

export default class CustomerCRMScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const message = () => { v.openSms(); setTimeout(() => { const el = document.getElementById('crm-activity'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0); };
    const orders = v.ordAll ? v.orders : v.orders.slice(0, 5);
    return (
      <div className="dc-screen ds" data-screen="CustomerCRM">
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Customers / All customers" page="Customer profile" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader back="/all-customers" backLabel="All customers" title={v.profName}
                  about="One customer: what they bought, their messages, points, addresses and the controls for their account."
                  badges={<><__StatusBadge tone="warning" icon="crown">Gold</__StatusBadge><__StatusBadge tone={v.stTone}>{v.stTxt}</__StatusBadge></>}
                  meta={'Customer since 2 Mar 2026 · ' + v.profArea + ' · Buys: ' + v.profTypes}
                  secondary={[{ label: 'Edit', onClick: v.openEditProf }, { label: 'Call', onClick: v.call }]}
                  more={[
                    v.profWhole ? { label: 'Wholesale profile', href: v.profWholeHref } : null,
                    { label: 'Assign coupon', onClick: v.openCoupon },
                    { label: 'Add wallet credit', onClick: v.openCredit },
                    { label: 'Give or take points', onClick: v.openPoints },
                    { label: 'Send password reset', onClick: v.resetPw },
                    { label: 'Log out of all devices', onClick: v.logoutAll },
                    v.isActive ? { label: 'Suspend customer', onClick: v.openSuspend, tone: 'danger' } : { label: 'Turn account back on', onClick: v.unsuspend },
                  ].filter(Boolean)}
                  primary={{ label: 'Message', onClick: message }} />

                <MetricStrip label="Customer figures" items={[
                  { label: 'Lifetime value', value: '৳58,200', sub: 'since Mar 2026' },
                  { label: 'Orders', value: '14', sub: '12 delivered' },
                  { label: 'Average order', value: '৳4,157', sub: 'top 15%' },
                  { label: 'Loyalty points', value: v.pts, sub: '= ' + v.ptsTk + ' off' },
                  { label: 'Wallet credit', value: v.credit },
                ]} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--pad" aria-label="Next best action">
                      <div className="crm-nba">
                        <__Icon name="sparkles" width="18" height="18" aria-hidden="true" />
                        <div><b>Send 10% off Vitamin C Serum <InfoTip text="She looked at it 4 times and left a ৳3,240 cart this morning. Customers like her come back 38% of the time with a small code." /></b><span className="crm-sub">Next best action</span></div>
                        {v.nbaOpen ? (
                          <span className="crm-nba__acts">
                            <button type="button" className="ix-btn ix-btn--sm" onClick={v.skipNba}>Not now</button>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={v.sendNba}><__Icon name="send" width="16" height="16" aria-hidden="true" />Send on WhatsApp</button>
                          </span>
                        ) : <__StatusBadge tone="success">{v.nbaTxt}</__StatusBadge>}
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="crm-orders">
                      <header className="ix-card__head"><h2 id="crm-orders">Orders</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.toggleOrders}>{v.ordAll ? 'Show less' : 'View all'}</button></header>
                      <ul className="ix-plist" aria-label="Orders">
                        {orders.map((o) => (
                          <li key={o.no}><__Link href="/order-detail" className="ix-pitem"><span className="ix-pitem__top"><b className="ly-fig">{o.no}</b><span>{o.amt}</span></span><span className="ix-pitem__mid">{o.date} · {o.items}</span><span className="ix-pitem__tags"><__StatusBadge tone={o.tone}>{o.st}</__StatusBadge></span></__Link></li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th></tr></thead>
                          <tbody>
                            {orders.map((o) => (
                              <tr key={o.no}>
                                <td><__Link href="/order-detail" className="ix-strong ly-fig">{o.no}</__Link></td>
                                <td className="ix-muted">{o.date}</td>
                                <td>{o.items}</td>
                                <td className="ix-num">{o.amt}</td>
                                <td><__StatusBadge tone={o.tone}>{o.st}</__StatusBadge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="ix-foot"><span>Total paid ৳58,200 · Refunded ৳650 · Cancelled ৳1,240 · Favourite payment bKash</span></div>
                    </section>

                    <section className="ix-card" id="crm-activity" aria-label="Activity">
                      <div className="ix-bar"><IndexTabs tabs={v.tabs} label="Customer sections" /></div>
                      <div className="crm-pane">
                        {v.is_timeline ? (
                          <ul className="crm-list" aria-label="Timeline">
                            {v.tl.map((e, i) => (
                              <li key={i}><span className="crm-ic" aria-hidden="true"><__Icon name={e.icon} width="14" height="14" /></span><div><b>{e.what}</b><span className="crm-sub">{e.sub}</span></div><span className="crm-when">{e.when}</span></li>
                            ))}
                          </ul>
                        ) : null}

                        {v.is_messages ? (
                          <div className="crm-two">
                            <div className="crm-msg">
                              <div className="gc-seg" role="group" aria-label="Channel">
                                {v.mTabs.map((m) => <button key={m.l} type="button" className={'gc-seg__btn' + (m.on ? ' gc-seg__btn--active' : '')} aria-pressed={m.on} onClick={m.pick}>{m.l}</button>)}
                              </div>
                              {v.isEmailM ? <input className="gc-input" value={v.mSubj} onChange={v.typeSubj} aria-label="Email subject" placeholder="Subject" /> : null}
                              <textarea className="gc-input crm-bn" rows={v.mRows} value={v.mBody} onChange={v.typeBody} aria-label="Message" style={{ height: 'auto', resize: 'vertical' }} />
                              <div className="crm-vars"><span>Insert:</span>{v.mVars.map((x) => <button key={x.t} type="button" onClick={x.pick}>{x.t}</button>)}<span>{v.mCount}</span></div>
                              <div className="ix-chips">
                                <button type="button" className="ix-btn ix-btn--primary" onClick={v.sendMsg}><__Icon name="send" width="16" height="16" aria-hidden="true" />{v.sendLabel}</button>
                                <button type="button" className="ix-btn">Save as template</button>
                              </div>
                            </div>
                            <div>
                              <h3>Message history</h3>
                              <div className="crm-hist">
                                {v.history.map((h, i) => (
                                  <div key={i} className={h.fresh ? 'is-new' : ''}><small><b>{h.ch}</b><span>{h.when} · {h.by}</span><span>{h.st}</span></small><span className="crm-bn">{h.text}</span></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {v.is_tickets ? (
                          <ul className="crm-list" aria-label="Support tickets">
                            {v.tickets.map((t) => (
                              <li key={t.no}><div><__Link href="/support-tickets" className="ix-strong">{t.title}</__Link><span className="crm-sub"><span className="ly-fig">{t.no}</span> · {t.sub}</span></div><__StatusBadge tone={t.tone}>{t.st}</__StatusBadge></li>
                            ))}
                          </ul>
                        ) : null}

                        {v.is_carts ? (
                          <div className="crm-two">
                            <div>
                              <h3>Abandoned cart · left today 10:45 AM · ৳3,240</h3>
                              <ul className="crm-list">
                                {v.cart.map((i) => <li key={i.name}><div><b>{i.name}</b><span className="crm-sub">Qty {i.qty}</span></div><span className="ix-strong">{i.price}</span></li>)}
                              </ul>
                              <p className="ly-help" style={{ margin: 'var(--space-2) 0' }}>Reminder 1 sent on WhatsApp at 11:45 AM · opened</p>
                              <div className="ix-chips">
                                <button type="button" className="ix-btn ix-btn--sm" onClick={v.remindCart}><__Icon name="send" width="16" height="16" aria-hidden="true" />Send reminder now</button>
                                <button type="button" className="ix-btn ix-btn--sm" onClick={v.openCoupon}><__Icon name="ticket-percent" width="16" height="16" aria-hidden="true" />Give a cart coupon</button>
                              </div>
                            </div>
                            <div>
                              <h3>Favourites · 4 items</h3>
                              <ul className="crm-list">
                                {v.favs.map((x) => <li key={x.name}><div><b>{x.name}</b>{x.note ? <span className={'crm-sub ' + x.nc}>{x.note}</span> : null}</div><span className="ix-strong">{x.price}</span></li>)}
                              </ul>
                            </div>
                          </div>
                        ) : null}

                        {v.is_search ? (
                          <div className="crm-two">
                            <div>
                              <h3>Searches</h3>
                              <ul className="crm-list">
                                {v.searches.map((q) => <li key={q.q}><div><b className="crm-bn">{q.q}</b><span className="crm-sub">{q.when}</span></div><span className={q.none ? 'ix-warn' : 'ix-muted'} style={{ fontSize: 'var(--text-xs)' }}>{q.res}</span></li>)}
                              </ul>
                            </div>
                            <div>
                              <h3>Recently viewed</h3>
                              <ul className="crm-list">
                                {v.viewed.map((x) => <li key={x.name}><div><b>{x.name}</b><span className="crm-sub">{x.times}</span></div><__StatusBadge tone={x.tone}>{x.tag}</__StatusBadge></li>)}
                              </ul>
                            </div>
                          </div>
                        ) : null}

                        {v.is_rewards ? (
                          <div className="crm-msg">
                            <div className="ix-chips">
                              <button type="button" className="ix-btn ix-btn--sm" onClick={v.openCoupon}><__Icon name="ticket-percent" width="16" height="16" aria-hidden="true" />Assign coupon</button>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={v.openPoints}><__Icon name="star" width="16" height="16" aria-hidden="true" />Give or take points</button>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={v.openCredit}><__Icon name="wallet" width="16" height="16" aria-hidden="true" />Add credit</button>
                            </div>
                            <ul className="crm-list" aria-label="Coupons">
                              {v.coupons.map((c) => <li key={c.code}><div><b className="ly-fig">{c.code}</b><span className="crm-sub">{c.gives} · {c.from} · {c.got}</span></div><span style={{ textAlign: 'right' }}><__StatusBadge tone={c.tone}>{c.st}</__StatusBadge><span className="crm-sub">{c.note}</span></span></li>)}
                            </ul>
                            <KV rows={[['Loyalty points', v.pts + ' · earned 2,105 · used 260 · 400 expire on 30 Sep'], ['Reward and wallet credit', v.credit + ' · refunds ৳650 · referral rewards ৳600 · added by staff ' + v.staffCredit]]} />
                          </div>
                        ) : null}

                        {v.is_security ? (
                          <div className="crm-msg">
                            <KV rows={[['Last login', '19 Sep 2026, 10:42 AM'], ['Last login IP', <span className="ly-fig">103.112.54.21 · Mirpur, Dhaka · Grameenphone</span>], ['Sign-up IP', <span className="ly-fig">103.87.214.9 · 2 Mar 2026 · Dhaka</span>], ['Risk check', <span className="ly-in">No risk · 1 return in 14 orders</span>]]} />
                            <div className="ix-table-wrap ix-table-wrap--show crm-box">
                              <table className="ix-table ix-table--static gc-table--keep">
                                <thead><tr><th scope="col">IP address</th><th scope="col">Area (approx.)</th><th scope="col">Device</th><th scope="col">Last seen</th><th scope="col" className="ix-num">Logins</th></tr></thead>
                                <tbody>
                                  {v.ips.map((x) => <tr key={x.ip}><td className="ly-fig">{x.ip}</td><td>{x.area}<span className="crm-sub">{x.net}</span></td><td className="ix-muted">{x.dev}</td><td className="ix-muted">{x.last}<span className="crm-sub">first {x.first}</span></td><td className="ix-num">{x.n}</td></tr>)}
                                </tbody>
                              </table>
                            </div>
                            <div className="ix-chips">
                              <button type="button" className="ix-btn ix-btn--sm" onClick={v.logoutAll}><__Icon name="lock" width="16" height="16" aria-hidden="true" />Log out of all devices</button>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={v.resetPw}><__Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Send password reset</button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <details className="ix-card gc-disclose">
                      <summary>Spending and buying</summary>
                      <div className="crm-pane crm-two">
                        <div className="crm-msg">
                          <div className="ly-row"><span className="ly-grow crm-sub">Last 12 months · ৳58,200 total</span>
                            <span className="gc-seg" role="group" aria-label="Range">{v.rng.map((r) => <button key={r.l} type="button" className={'gc-seg__btn' + (r.on ? ' gc-seg__btn--active' : '')} aria-pressed={r.on} onClick={r.pick}>{r.l}</button>)}</span>
                          </div>
                          <div className="crm-bars" role="img" aria-label={v.bars.map((b) => b.tip).join(', ')}>
                            {v.bars.map((b) => <div key={b.m} title={b.tip}><i className={b.last ? 'is-last' : b.top ? 'is-top' : ''} style={{ height: b.h }} /></div>)}
                          </div>
                          <div className="crm-months">{v.bars.map((b) => <span key={b.m}>{b.m}</span>)}</div>
                        </div>
                        <div className="crm-msg">
                          <h3 className="crm-set-h">Order outcomes · 14 orders · 86% delivered</h3>
                          {v.donut.map((d) => (
                            <div key={d.l} className="crm-meter"><div><span>{d.l}</span><b>{d.n}</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: d.w, background: d.c }} /></span></div>
                          ))}
                          <span className="crm-sub">Return rate 7% · shop average 11%</span>
                          <h3 className="crm-set-h">What she buys · by money spent</h3>
                          {v.cats.map((c) => (
                            <div key={c.l} className="crm-meter"><div><span>{c.l}</span><b>{c.v}</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: c.w }} /></span></div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>

                  <aside className="ix-side">
                    <section className="ix-card crm-card" aria-labelledby="crm-who">
                      <header className="ix-card__head"><h2 id="crm-who">Customer</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.openEditProf} aria-haspopup="dialog">Edit</button></header>
                      <div className="ix-card__body">
                        <KV rows={[
                          ['Phone', <span><span className="ly-fig">{v.profPhone}</span> · verified</span>],
                          ['Email', 'nusrat.jahan@example.com'],
                          ['Buys', v.profTypes],
                          ['Birthday', '14 Nov'],
                          ['Came from', 'Facebook ad “Eid skin care”'],
                          ['Likes messages by', 'WhatsApp'],
                          ['Customer ID', <span className="ly-fig">C-10482</span>],
                          ['Last login', 'Today 10:42 AM · Android'],
                        ]} />
                        <div className="ly-field">
                          <label className="gc-label" htmlFor="crm-staff">Looked after by</label>
                          <select id="crm-staff" className="gc-input gc-select" aria-label="Assigned staff"><option>Tania (support)</option><option>Karim (sales)</option><option>Shanto (owner)</option></select>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-addr">
                      <header className="ix-card__head"><h2 id="crm-addr">Addresses · {v.addrCount}</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.openAddr}>Add address</button></header>
                      <div className="ix-card__body">
                        <ul className="crm-list">
                          {v.addrs.map((ad) => (
                            <li key={ad.id}>
                              <div className="crm-addr">
                                <span><b>{ad.label}</b>{ad.isDef ? <__StatusBadge tone="primary" icon="star">Default</__StatusBadge> : null}</span>
                                <span>{ad.line}</span>
                                <span className="crm-sub">{ad.who} · <span className="ly-fig">{ad.phone}</span> · {ad.used}</span>
                              </div>
                              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                                ad.notDef ? { label: 'Make default', onClick: ad.makeDef } : null,
                                { label: 'Edit', onClick: ad.edit },
                                ad.notDef ? { label: 'Remove', onClick: ad.remove, tone: 'danger', aria: `Remove ${ad.label}` } : null,
                              ].filter(Boolean)} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-loy">
                      <header className="ix-card__head"><h2 id="crm-loy">Road to Platinum</h2><__Link href="/member-detail">Member</__Link></header>
                      <div className="ix-card__body">
                        <div className="crm-meter"><div><span>GOLD · 1.5× points</span><b>39%</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: '39%' }} /></span><span className="crm-sub">৳58,200 of ৳1,50,000 · Buy ৳91,800 more to unlock 2× points</span></div>
                        <KV rows={[['Loyalty points', v.pts + ' = ' + v.ptsTk], ['Wallet credit', v.credit], ['Coupons', '6 / 9 used / received']]} />
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-tags">
                      <header className="ix-card__head"><h2 id="crm-tags">Tags <InfoTip text="Used in filters and customer groups" /></h2></header>
                      <div className="ix-card__body">
                        <div className="ix-chips">{v.tagChips.map((c) => <button key={c.label} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.label}</button>)}</div>
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-notes">
                      <header className="ix-card__head"><h2 id="crm-notes">Notes</h2></header>
                      <div className="ix-card__body">
                        <div className="ly-row">
                          <input className="gc-input ly-grow" value={v.noteTxt} onChange={v.typeNote} placeholder="Write a note for your team — the customer never sees it" aria-label="New note" />
                          <button type="button" className="ix-btn" onClick={v.addNote}>Add note</button>
                        </div>
                        <ul className="crm-list">
                          {v.notes.map((n, i) => <li key={i}><div><span style={{ fontSize: 'var(--text-sm)' }}>{n.t}</span><span className="crm-sub">{n.by}</span></div></li>)}
                        </ul>
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-ctl">
                      <header className="ix-card__head"><h2 id="crm-ctl">Quick controls <InfoTip text="Changes save straight away" /></h2></header>
                      <div className="ix-card__body">
                        <div>
                          <p className="crm-set-h">Payment methods</p>
                          {SWITCHES.map(([k, label]) => <div key={k} className="ly-set"><div><b>{label}</b></div><span className={v[k]?.on ? 'ly-in' : 'ly-out'} style={{ fontSize: 'var(--text-xs)' }}>{v[k]?.t}</span><Switch on={v[k]?.on} onToggle={v[k]?.toggle} label={label} /></div>)}
                        </div>
                        <div>
                          <p className="crm-set-h">Offers by</p>
                          {OFFERS.map(([k, label]) => <div key={k} className="ly-set"><div><b>{label}</b></div><span className={v[k]?.on ? 'ly-in' : 'ly-out'} style={{ fontSize: 'var(--text-xs)' }}>{v[k]?.t}</span><Switch on={v[k]?.on} onToggle={v[k]?.toggle} label={label} /></div>)}
                        </div>
                        <div>
                          <p className="crm-set-h">Limits</p>
                          <div className="ly-set"><div><b>Max cash-on-delivery order</b></div><select className="gc-input gc-select crm-sel" aria-label="Max COD order"><option>No limit</option><option>৳3,000</option><option>৳5,000</option><option>৳10,000</option></select></div>
                          <div className="ly-set"><div><b>Ask for advance payment above</b></div><select className="gc-input gc-select crm-sel" aria-label="Advance payment"><option>Never</option><option>৳5,000</option><option>৳10,000</option></select></div>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card crm-card" aria-labelledby="crm-acct">
                      <header className="ix-card__head"><h2 id="crm-acct">{v.acctTitle}</h2></header>
                      <div className="ix-card__body">
                        <p className="ly-help">{v.acctSub}</p>
                        {v.isActive ? <button type="button" className="ix-btn ix-btn--danger" onClick={v.openSuspend}>Suspend customer</button> : <button type="button" className="ix-btn" onClick={v.unsuspend}>Turn account back on</button>}
                      </div>
                    </section>
                  </aside>
                </div>
              </div>
            </div>
            <__Dialog open={!!v.mOpen} title={v.mTitle} onClose={v.closeM} width={520} footer={<>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeM}>Cancel</button>
              <button type="button" className={'gc-btn gc-btn--sm gc-btn--solid' + (v.mDanger ? ' gc-btn--error' : '')} onClick={v.confirmM}>{v.mBtn}</button>
            </>}>
              <div className="crm-dialog">
                {v.mCoupon ? (<>
                  <div><label className="gc-label" htmlFor="crm-c-coupon">Coupon</label><select id="crm-c-coupon" className="gc-input gc-select" aria-label="Coupon"><option>Make a one-time code just for her</option><option>EID300 — ৳300 off on ৳2,000+</option><option>SKIN15 — 15% off skin care</option><option>GOLD500 — ৳500 off on ৳5,000+</option></select></div>
                  <div className="ly-two">
                    <div><label className="gc-label" htmlFor="crm-c-disc">Discount</label><select id="crm-c-disc" className="gc-input gc-select" aria-label="Discount"><option>10% off, up to ৳300</option><option>৳100 off</option><option>৳200 off</option><option>Free delivery</option></select></div>
                    <div><label className="gc-label" htmlFor="crm-c-valid">Works for</label><select id="crm-c-valid" className="gc-input gc-select" aria-label="Valid for"><option>7 days</option><option>3 days</option><option>14 days</option><option>30 days</option></select></div>
                  </div>
                  <div><label className="gc-label" htmlFor="crm-c-ch">Tell her by</label><select id="crm-c-ch" className="gc-input gc-select" aria-label="Channel"><option>WhatsApp</option><option>SMS</option><option>Email</option><option>Don’t send a message</option></select></div>
                </>) : null}
                {v.mCredit ? (<>
                  <div className="ly-row"><Steps label="credit amount" less="Less credit amount" more="More credit amount" display={v.cAmt} onDec={v.cdn} onInc={v.cup} /><span>goes into her wallet — she can pay with it</span></div>
                  <div><label className="gc-label" htmlFor="crm-cr-why">Why?</label><select id="crm-cr-why" className="gc-input gc-select" aria-label="Reason"><option>Sorry for a late delivery</option><option>Refund</option><option>Gift</option><option>Fix a mistake</option></select></div>
                </>) : null}
                {v.mPoints ? (<>
                  <div className="gc-seg" role="group" aria-label="Give or take">{v.pOps.map((w) => <button key={w.l} type="button" className={'gc-seg__btn' + (w.on ? ' gc-seg__btn--active' : '')} aria-pressed={w.on} onClick={w.pick}>{w.l}</button>)}</div>
                  <div className="ly-row"><Steps label="points" less="Less points" more="More points" display={v.pAmt} onDec={v.pdn} onInc={v.pup} /><span>points</span></div>
                  <div><label className="gc-label" htmlFor="crm-p-why">Why?</label><input id="crm-p-why" className="gc-input" placeholder="e.g. Sorry gift" aria-label="Reason" /></div>
                </>) : null}
                {v.mSuspend ? (<>
                  <div><label className="gc-label" htmlFor="crm-s-why">Reason</label><select id="crm-s-why" className="gc-input gc-select" value={v.susReason} onChange={v.setSusReason} aria-label="Reason"><option>Too many returned orders</option><option>Fake or prank orders</option><option>Abusive to staff</option><option>Asked to close the account</option></select></div>
                  <div><label className="gc-label" htmlFor="crm-s-long">For how long</label><select id="crm-s-long" className="gc-input gc-select" aria-label="Duration"><option>Until I turn it back on</option><option>7 days</option><option>30 days</option></select></div>
                  <p className="gc-help gc-help--error" style={{ margin: 0 }}>She will not be able to log in or place orders. Open orders stay as they are.</p>
                </>) : null}
                {v.mAddr ? (<>
                  <div className="ix-chips" role="group" aria-label="Label">{v.addrLabels.map((al) => <button key={al.l} type="button" className="ix-chip" aria-pressed={al.on} onClick={al.pick}>{al.l}</button>)}</div>
                  <div className="ly-two">
                    <div><label className="gc-label" htmlFor="crm-a-name">Receiver name</label><input id="crm-a-name" className="gc-input" defaultValue="Nusrat Jahan" aria-label="Receiver name" /></div>
                    <div><label className="gc-label" htmlFor="crm-a-phone">Receiver phone</label><input id="crm-a-phone" className="gc-input ly-fig" defaultValue="01552-3X1-907" aria-label="Receiver phone" /></div>
                  </div>
                  <div className="ly-two">
                    <div><label className="gc-label" htmlFor="crm-a-div">Division</label><select id="crm-a-div" className="gc-input gc-select" aria-label="Division"><option>Dhaka</option><option>Chattogram</option><option>Sylhet</option><option>Khulna</option><option>Rajshahi</option><option>Barishal</option><option>Rangpur</option><option>Mymensingh</option></select></div>
                    <div><label className="gc-label" htmlFor="crm-a-dis">District</label><select id="crm-a-dis" className="gc-input gc-select" aria-label="District"><option>Dhaka</option><option>Gazipur</option><option>Narayanganj</option></select></div>
                  </div>
                  <div><label className="gc-label" htmlFor="crm-a-area">Area</label><select id="crm-a-area" className="gc-input gc-select" aria-label="Area"><option>Dhanmondi</option><option>Mirpur</option><option>Gulshan</option><option>Uttara</option></select></div>
                  <div><label className="gc-label" htmlFor="crm-a-line">House, road, landmark</label><input id="crm-a-line" className="gc-input" value={v.newLine} onChange={v.typeLine} placeholder="e.g. House 5, Road 12, near Rapa Plaza" aria-label="Full address" /></div>
                  <label className="ly-row"><input type="checkbox" className="gc-check" checked={v.newDef} onChange={v.toggleNewDef} />Make this the default address</label>
                </>) : null}
              </div>
            </__Dialog>
            <CustomerEditDialog open={v.editProfOpen} customer={v.editProf} onSave={v.saveProfile} onClose={v.closeEditProf} />
          </main>
        </div>
      </div>
    );
  }
}
