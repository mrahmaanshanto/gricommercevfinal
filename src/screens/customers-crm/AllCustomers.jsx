'use client';
// Generated from design/templates/customers-crm/AllCustomers.dc.html by scripts/convert-design.mjs.
// AllCustomers — Customers CRM — All customers.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { addCustomer, getCustomers, tierOf, PRICE_TIERS, updateCustomer, mergeCustomers, phoneDigits } from '@/lib/customers';
import { getInvoices } from '@/lib/invoices';
import { getDemoEdits, saveDemoEdit, getMerges, addMerge, getNotDupes, addNotDupe, removeFromBook } from '@/lib/customerEdits';
import CustomerEditDialog from './CustomerEditDialog';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, Dialog as __Dialog, EmptyState as __EmptyState, PhoneMore as __PhoneMore } from '@/components/ui';
import { toast as uiToast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
// Demo list rows (not in the customer book). `id` keys their edits and merges in this browser;
// `due` is what they still owe on credit or cash-on-delivery orders.
var C = [
  { id: 'c01', name: 'Nusrat Jahan', phone: '01552-3X1-907', email: 'nusrat.jahan@example.com', city: 'Dhaka', address: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', types: ['Online'], signup: '2 Mar 2026', orders: 14, spent: 58200, due: 0, last: '12 Sep 2026', pts: 1845, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'cart'] },
  { id: 'c02', name: 'Rafiq Uddin', phone: '01911-7X3-608', email: 'rafiq.u@example.com', city: 'Chattogram', address: 'Agrabad C/A, Chattogram', types: ['Online'], signup: '19 Sep 2026', orders: 1, spent: 124500, due: 0, last: '19 Sep 2026', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['signToday', 'orderToday', 'big', 'week'] },
  { id: 'c03', name: 'Farzana Akter', phone: '01711-2X4-518', email: 'farzana.a@example.com', city: 'Dhaka', address: 'Flat 6A, Road 11, Banani, Dhaka', types: ['Online', 'Retail'], signup: '11 Jan 2025', orders: 31, spent: 186400, due: 0, last: '19 Sep 2026', pts: 4820, level: 'Platinum', status: 'Active', src: 'Invite a friend', f: ['orderToday', 'repeat', 'big'] },
  { id: 'c04', name: 'Sadia Islam', phone: '01624-9X2-310', email: 'sadia.i@example.com', city: 'Sylhet', address: 'Zindabazar, Sylhet', types: ['Online'], signup: '19 Sep 2026', orders: 0, spent: 0, due: 0, last: '—', pts: 50, level: 'Member', status: 'Active', src: 'Facebook ad', f: ['signToday', 'noOrder', 'week'] },
  { id: 'c05', name: 'Tanvir Ahmed', phone: '01914-6X2-045', email: 'tanvir.a@example.com', city: 'Khulna', address: 'KDA Avenue, Khulna', types: ['Online'], signup: '8 May 2026', orders: 8, spent: 24300, due: 1850, last: '15 Sep 2026', pts: 640, level: 'Silver', status: 'COD blocked', src: 'Instagram', f: ['repeat', 'codBlock', 'pts'] },
  { id: 'c06', name: 'Mahmudul Islam', phone: '01733-8X0-614', email: 'mahmud.i@example.com', city: 'Dhaka', address: 'Mohakhali DOHS, Dhaka', types: ['Online'], signup: '14 Sep 2026', orders: 2, spent: 4650, due: 0, last: '19 Sep 2026', pts: 92, level: 'Member', status: 'Active', src: 'TikTok', f: ['orderToday', 'week', 'cart'] },
  { id: 'c07', name: 'Sabrina Chowdhury', phone: '01511-5X3-770', email: 'sabrina.c@example.com', city: 'Rajshahi', address: 'Shaheb Bazar, Rajshahi', types: ['Retail'], signup: '2 Feb 2026', orders: 3, spent: 2980, due: 0, last: '28 Aug 2026', pts: 58, level: 'Member', status: 'Active', src: 'Shop counter (POS)', f: ['pts', 'bday'] },
  { id: 'c08', name: 'Rakibul Hasan', phone: '01819-0X7-332', email: 'rakib.h@example.com', city: 'Dhaka', address: 'Shyamoli Ring Road, Dhaka', types: ['Online', 'Retail'], signup: '20 Jul 2025', orders: 19, spent: 72850, due: 0, last: '16 Sep 2026', pts: 2310, level: 'Gold', status: 'Active', src: 'Facebook ad', f: ['repeat', 'big', 'bday'] },
  { id: 'c09', name: 'Guest · 01822-1X5-947', phone: '01822-1X5-947', email: '—', city: 'Dhaka', address: '', types: ['Online'], signup: '18 Sep 2026', orders: 0, spent: 0, due: 0, last: '—', pts: 0, level: 'Member', status: 'Active', src: 'Google', f: ['noOrder', 'cart', 'week'] },
  { id: 'c10', name: 'Kamrul Hossain', phone: '01777-3X8-129', email: 'kamrul.h@example.com', city: 'Outside Dhaka', address: 'Sadar Road, Cumilla', types: ['Online'], signup: '3 Apr 2026', orders: 6, spent: 9100, due: 2400, last: '1 Aug 2026', pts: 0, level: 'Member', status: 'Suspended', src: 'Facebook ad', f: ['suspended'] },
  // the same people entered twice: once at the shop counter, once online
  { id: 'c11', name: 'Rakib Hasan', phone: '01819-0X7-332', email: '—', city: 'Dhaka', address: 'Shyamoli, Dhaka', types: ['Retail'], signup: '4 Sep 2026', orders: 2, spent: 3150, due: 650, last: '11 Sep 2026', pts: 0, level: 'Member', status: 'Active', src: 'Shop counter (POS)', f: ['repeat'] },
  { id: 'c12', name: 'Tanvir Ahmad', phone: '01914-6X2-540', email: 'tanvir.ahmad@example.com', city: 'Khulna', address: 'KDA Avenue, Khulna', types: ['Online'], signup: '17 Sep 2026', orders: 1, spent: 1290, due: 0, last: '17 Sep 2026', pts: 26, level: 'Member', status: 'Active', src: 'Instagram', f: ['week'] }
];
var VIEWS = [
  { k: 'all', label: 'All customers', n: 2452 }, { k: 'wholesale', label: 'Wholesale customers', n: 0 }, { k: 'signToday', label: 'Signed up today', n: 14 }, { k: 'orderToday', label: 'Ordered today', n: 38 }, { k: 'week', label: 'New this week', n: 61 },
  { k: 'noOrder', label: 'Signed up, no order yet', n: 212 }, { k: 'repeat', label: 'Repeat buyers', n: 486 }, { k: 'big', label: 'Big spenders', n: 124 }, { k: 'cart', label: 'Left a cart', n: 31 },
  { k: 'pts', label: 'Points expiring', n: 64 }, { k: 'bday', label: 'Birthday this month', n: 97 }, { k: 'codBlock', label: 'COD blocked', n: 3 }, { k: 'suspended', label: 'Suspended', n: 6 },
  { k: 'dupes', label: 'Possible duplicates', n: 0 }
];
var COLS = [
  { k: 'email', l: 'Email' }, { k: 'city', l: 'City' }, { k: 'signup', l: 'Signed up' }, { k: 'orders', l: 'Orders', al: 'right' }, { k: 'spent', l: 'Total spent', al: 'right' },
  { k: 'due', l: 'Due', al: 'right' }, { k: 'last', l: 'Last order' }, { k: 'pts', l: 'Points', al: 'right' }, { k: 'level', l: 'Level' }, { k: 'src', l: 'Came from' }, { k: 'status', l: 'Status' }
];
var DEFCUSTOM = { city: true, orders: true, spent: true, due: true, last: true, status: true };
var SCLS = { 'Active': 'badge b-received', 'Suspended': 'badge b-cancelled', 'COD blocked': 'badge b-approval' };
var LCLS = { Member: 'badge t-member', Silver: 'badge t-silver', Gold: 'badge t-gold', Platinum: 'badge t-plat' };
// Views shown as chips, in priority order. The chip row drops chips from the end when the row is
// too narrow (container queries in the CSS below); a dropped chip shows up in "More views" instead.
var PRIMARY = ['all', 'wholesale', 'signToday', 'orderToday', 'week', 'repeat', 'big'];
var TODAY = '19 Sep 2026'; // "today" in the demo data
var EMPTY_FORM = { name: '', phone: '', area: '', types: ['Online'], tier: 'A', credit: '' };
var CUST_TYPES = ['Online', 'Retail', 'Wholesale'];   // how the customer buys; one, two or all three
function compact(x) { return String(x || '').replace(/[\s\-().]/g, '').toLowerCase(); }
/** Bangladeshi mobile as 11 digits (01XXXXXXXXX), or '' when it is not one. Accepts +88 / 88 prefixes. */
function bdMobile(x) { var d = compact(x); if (d.indexOf('+88') === 0) d = d.slice(3); else if (d.indexOf('88') === 0 && d.length === 13) d = d.slice(2); return /^01[3-9]\d{8}$/.test(d) ? d : ''; }
function fmtPhone(d) { return d.slice(0, 5) + '-' + d.slice(5, 8) + '-' + d.slice(8); }
function matches(c, q) {
  var t = q.trim().toLowerCase(); if (!t) return true;
  if (c.name.toLowerCase().indexOf(t) >= 0 || String(c.email || '').toLowerCase().indexOf(t) >= 0) return true;
  var p = compact(t); return !!p && compact(c.phone).indexOf(p) >= 0;
}
// ---- possible duplicates: the same mobile number, or names that differ by a letter or two ----
function normName(n) { return String(n || '').toLowerCase().replace(/[^a-zঀ-৿ ]/g, '').replace(/\s+/g, ' ').trim(); }
function editDistance(a, b) {
  var prev = [], cur, i, j;
  for (j = 0; j <= b.length; j++) prev[j] = j;
  for (i = 1; i <= a.length; i++) {
    cur = [i];
    for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function findPairs(rows, notDupes) {
  var out = [], live = rows.filter(function (r) { return !r.hidden && r.name.indexOf('Guest') !== 0; });
  for (var i = 0; i < live.length; i++) for (var j = i + 1; j < live.length; j++) {
    var a = live[i], b = live[j], da = phoneDigits(a.phone), db = phoneDigits(b.phone);
    var samePhone = da.length >= 9 && da === db;
    var na = normName(a.name), nb = normName(b.name);
    var nearName = na === nb || (Math.min(na.length, nb.length) >= 8 && editDistance(na, nb) <= 2);
    if (!samePhone && !nearName) continue;
    var id = [a.key, b.key].sort().join('|');
    if (notDupes.indexOf(id) >= 0) continue;
    out.push({ id: id, a: a, b: b, why: samePhone && nearName ? 'Same mobile number and a similar name' : samePhone ? 'Same mobile number' : na === nb ? 'Same name' : 'Similar names' });
  }
  return out;
}
function statsOfPhone(inv, digits) {
  var own = inv.filter(function (r) { return r.customer.phone === digits; });
  return { own: own, orders: own.length, spent: Math.round(own.reduce(function (a, r) { return a + r.totals.total; }, 0)), due: Math.round(own.reduce(function (a, r) { return a + Math.max(0, r.due); }, 0)) };
}
function typesText(types) { return (types || []).length ? types.join(', ') : '—'; }
/** Wholesale buyers open the wholesale profile; everyone else the customer profile. */
function hrefOf(c) { return c.wholesale ? '/wholesale-customer?phone=' + (c.digits || phoneDigits(c.phone)) + (c.book ? '' : '&demo=' + c.id) : '/customer-crm'; }
/** One side of a duplicate pair, as shown in the list and the merge dialog. */
function sideOf(c) {
  return { name: c.name, phone: c.phone, initial: c.name.charAt(0).toUpperCase(), href: hrefOf(c), orders: c.orders.toLocaleString('en-IN'), spent: c.spent ? bdt(c.spent) : '—', due: c.due ? bdt(c.due) : '—', hasDue: !!c.due,
    types: typesText(c.types), src: c.src, signup: c.signup, last: c.last };
}

class Component extends DCLogic {
  componentDidMount() {
    try { var k = new URLSearchParams(window.location.search).get('view'); if (k && VIEWS.some(function (x) { return x.k === k; })) this.setState({ view: k }); } catch (e) { /* no URL access */ }
    document.addEventListener('mousedown', this.onDocDown);
    this.load();
  }
  /** Rows from the customer book (orders, spend and due from their invoices) and the demo list with the
   *  edits and merges made in this browser. Merged-away rows stay in the list with `hidden` set. */
  load = (justAdded) => {
    var inv = getInvoices(), edits = getDemoEdits(), merges = getMerges(), notDupes = getNotDupes();
    var book = getCustomers().map(function (c) {
      var st = statsOfPhone(inv, c.phone), tier = tierOf(c);
      var last = st.own[0] ? fmtDate(new Date(st.own[0].at)) : '—';
      var f = (tier ? ['wholesale'] : []).concat(st.orders > 1 ? ['repeat'] : st.orders ? [] : ['noOrder']).concat(c.signup === TODAY ? ['signToday', 'week'] : []);
      return { key: 'b:' + c.phone, book: true, name: c.name, phone: fmtPhone(c.phone), digits: c.phone, address: c.address || '', types: c.types || [], tier: c.tier, creditLimit: c.creditLimit || 0,
        email: '—', city: (c.address || '').split(',').slice(-2).join(',').trim() || '—', signup: c.signup || '—', orders: st.orders, spent: st.spent, due: st.due, last: last, pts: 0, level: 'Member', status: 'Active',
        src: c.src || (tier ? tier.label.split(' · ')[0] : typesText(c.types)), f: f, wholesale: !!tier, isNew: c.phone === justAdded };
    });
    var demo = C.map(function (c) {
      var e = edits[c.id] || {}, types = e.types || c.types, whole = types.indexOf('Wholesale') >= 0;
      var phone = e.phone || c.phone;
      return assign(assign({}, c), { key: 'd:' + c.id, book: false, name: e.name || c.name, phone: phone, digits: phoneDigits(phone), address: e.address != null ? e.address : c.address, types: types, tier: e.tier, creditLimit: e.creditLimit || 0,
        baseF: c.f, f: c.f.filter(function (x) { return x !== 'wholesale'; }).concat(whole ? ['wholesale'] : []), wholesale: whole,
        src: whole && c.types.indexOf('Wholesale') < 0 ? (PRICE_TIERS[e.tier] || PRICE_TIERS.A).label.split(' · ')[0] + ' · was ' + c.src : c.src });
    });
    var rows = book.concat(demo), byKey = {};
    rows.forEach(function (r) { byKey[r.key] = r; });
    // merged rows: a merged-away demo row is hidden here (the book hides its own); the kept row carries its orders, spend and due
    var dropped = {};
    merges.forEach(function (m) { dropped[m.drop] = m; });
    var baseOf = function (m) {
      if (m.drop.indexOf('b:') === 0) return statsOfPhone(inv, m.drop.slice(2));
      var d = C.filter(function (c) { return 'd:' + c.id === m.drop; })[0];
      return d ? { orders: d.orders, spent: d.spent, due: d.due } : { orders: 0, spent: 0, due: 0 };
    };
    var carried = function (key, seen) {
      var sum = { orders: 0, spent: 0, due: 0, names: [] };
      merges.forEach(function (m) {
        if (m.keep !== key || seen[m.drop]) return;
        seen[m.drop] = true;
        var b = baseOf(m), deeper = carried(m.drop, seen);
        sum.orders += b.orders + deeper.orders; sum.spent += b.spent + deeper.spent; sum.due += b.due + deeper.due; sum.names = sum.names.concat([m.dropName], deeper.names);
      });
      return sum;
    };
    rows.forEach(function (r) {
      if (dropped[r.key]) r.hidden = true;
      var x = carried(r.key, {});
      if (x.names.length) { r.orders += x.orders; r.spent += x.spent; r.due += x.due; r.mergedFrom = x.names; }
    });
    this.setState({ rows: rows, pairs: findPairs(rows, notDupes) });
  };

  // ---- edit a customer ----
  openEdit = (r) => {
    this.setState({ editRow: r, editCust: { name: r.name, phone: r.phone, address: r.address || '', types: r.types, tier: r.tier || 'A', creditLimit: r.creditLimit || 0 } });
  };
  closeEdit = () => { this.setState({ editRow: null }); };
  editPhoneTaken = (d) => {
    var s = this.state || {}, me = s.editRow;
    return (s.rows || []).some(function (r) { return !r.hidden && (!me || r.key !== me.key) && phoneDigits(r.phone) === d; });
  };
  saveEdit = (vals) => {
    var r = (this.state || {}).editRow; if (!r) return;
    var wasWhole = r.wholesale, isWhole = vals.types.indexOf('Wholesale') >= 0;
    if (r.book) updateCustomer(r.digits, { name: vals.name, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit });
    else saveDemoEdit(r.id, { name: vals.name, phone: vals.phone, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit, due: r.due });
    this.setState({ editRow: null });
    this.load();
    uiToast(vals.name + ' was updated.' + (isWhole && !wasWhole ? ' They now show under Wholesale customers.' : !isWhole && wasWhole ? ' They no longer buy wholesale.' : ''));
  };

  // ---- duplicates ----
  openMerge = (p) => { this.setState({ mergePair: p, keepKey: p.a.key }); };
  closeMerge = () => { this.setState({ mergePair: null }); };
  confirmMerge = () => {
    var s = this.state || {}, p = s.mergePair; if (!p) return;
    var keep = p.a.key === s.keepKey ? p.a : p.b, drop = keep === p.a ? p.b : p.a;
    if (drop.book) mergeCustomers(keep.digits || phoneDigits(keep.phone), drop.digits);
    addMerge({ keep: keep.key, drop: drop.key, dropName: drop.name, dropPhone: drop.phone });
    this.setState({ mergePair: null });
    this.load();
    var same = drop.name === keep.name;
    uiToast(drop.name + (same ? ' (' + drop.phone + ')' : '') + ' was merged into ' + keep.name + (same ? ' (' + keep.phone + ')' : '') + '. Their orders and spend now show on one customer.');
  };
  notDupe = (p) => {
    addNotDupe(p.id);
    this.load();
    uiToast(p.a.name + ' and ' + p.b.name + ' are kept as two customers.');
  };
  componentWillUnmount() { clearTimeout(this.t); document.removeEventListener('mousedown', this.onDocDown); }

  // ---- views (stored in the URL as ?view=<key>) ----
  setView = (k) => {
    this.setState({ view: k, sel: {}, moreOpen: false });
    try { var u = new URL(window.location.href); if (k === 'all') u.searchParams.delete('view'); else u.searchParams.set('view', k); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); } catch (e) { /* no URL access */ }
  };
  moreWrap = React.createRef(); moreBtn = React.createRef(); moreList = React.createRef();
  menuItems = () => { var box = this.moreList.current; return box ? Array.prototype.filter.call(box.querySelectorAll('[role="menuitemradio"]'), function (el) { return el.offsetParent !== null; }) : []; };
  toggleMore = () => {
    var open = !(this.state || {}).moreOpen;
    this.setState({ moreOpen: open }, () => { if (!open) return; var it = this.menuItems(); var cur = it.filter(function (el) { return el.getAttribute('aria-checked') === 'true'; })[0] || it[0]; if (cur) cur.focus(); });
  };
  closeMore = (refocus) => { this.setState({ moreOpen: false }, () => { if (refocus && this.moreBtn.current) this.moreBtn.current.focus(); }); };
  onDocDown = (e) => { if ((this.state || {}).moreOpen && this.moreWrap.current && !this.moreWrap.current.contains(e.target)) this.closeMore(false); };
  onMoreKey = (e) => {
    if (!(this.state || {}).moreOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.closeMore(true); return; }
    if (e.key === 'Tab') { this.closeMore(false); return; }
    var it = this.menuItems(); if (!it.length) return;
    var i = it.indexOf(document.activeElement), n = -1;
    if (e.key === 'ArrowDown') n = i < 0 ? 0 : (i + 1) % it.length;
    else if (e.key === 'ArrowUp') n = i < 0 ? it.length - 1 : (i - 1 + it.length) % it.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = it.length - 1;
    if (n >= 0) { e.preventDefault(); it[n].focus(); }
  };
  pickFromMenu = (k) => { this.setView(k); if (this.moreBtn.current) this.moreBtn.current.focus(); };

  // ---- search ----
  typeQ = (e) => { this.setState({ q: e.target.value, sel: {} }); };
  clearQ = () => { this.setState({ q: '', sel: {} }, function () { var el = document.getElementById('ac-search'); if (el) el.focus(); }); };
  showAll = () => { this.setState({ q: '' }); this.setView('all'); };

  // ---- add customer ----
  openAdd = () => { this.setState({ addOpen: true, form: EMPTY_FORM, errs: {} }); };
  closeAdd = () => { this.setState({ addOpen: false }); };
  typeField = (e) => {
    var s = this.state || {}, f = assign({}, s.form || EMPTY_FORM), er = assign({}, s.errs || {});
    f[e.target.name] = e.target.value; delete er[e.target.name];
    this.setState({ form: f, errs: er });
  };
  toggleType = (type) => {
    var s = this.state || {}, f = assign({}, s.form || EMPTY_FORM), er = assign({}, s.errs || {});
    var cur = f.types || [];
    f.types = type === 'all' ? (cur.length === CUST_TYPES.length ? [] : CUST_TYPES.slice()) : CUST_TYPES.filter(function (x) { return x === type ? cur.indexOf(x) < 0 : cur.indexOf(x) >= 0; });
    delete er.types;
    this.setState({ form: f, errs: er });
  };
  submitAdd = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    var s = this.state || {}, f = s.form || EMPTY_FORM, er = {};
    var name = f.name.trim().replace(/\s+/g, ' '), area = f.area.trim(), d = bdMobile(f.phone);
    if (!name) er.name = 'Enter the customer’s name.';
    else if (name.length < 2) er.name = 'The name needs at least 2 characters.';
    if (!f.phone.trim()) er.phone = 'Enter a mobile number.';
    else if (!d) er.phone = 'Enter an 11-digit Bangladeshi mobile number, like 01712345678.';
    else if ((s.rows || []).some(function (c) { return !c.hidden && phoneDigits(c.phone) === d; })) er.phone = 'A customer with this mobile number already exists.';
    var types = f.types || [], whole = types.indexOf('Wholesale') >= 0;
    if (!types.length) er.types = 'Choose at least one: Online, Retail or Wholesale.';
    var credit = String(f.credit || '').trim() === '' ? 0 : Number(f.credit);
    if (whole && (!isFinite(credit) || credit < 0)) er.credit = 'Enter 0 or more. 0 means no limit.';
    var first = er.name ? 'name' : er.phone ? 'phone' : er.types ? 'type-Online' : er.credit ? 'credit' : '';
    if (first) { this.setState({ errs: er }, function () { var el = document.getElementById('ac-add-' + first); if (el) el.focus(); }); return; }
    // kept in the customer book, so New sale finds the customer and loads the wholesale prices
    addCustomer({ name: name, phone: d, address: area, types: types, tier: whole ? (f.tier || 'A') : undefined, creditLimit: whole ? Math.round(credit) : 0, signup: TODAY,
      src: types.join(' · ') + (whole ? ' (' + PRICE_TIERS[f.tier || 'A'].label.split(' · ')[0] + ')' : '') + ' · added by staff' });
    var view = s.view || 'all', keep = view === 'all' || (whole && view === 'wholesale') || ['signToday', 'week', 'noOrder'].indexOf(view) >= 0;
    this.setState({ addOpen: false, q: '', sel: {} });
    this.load(d);
    if (!keep) this.setView('all');
    var self = this;
    uiToast(name + ' was added to your customers.', { undo: function () { removeFromBook(d); self.load(); } });
  };

  renderVals() {
    var self = this, s = this.state || {};
    var view = s.view || 'all', mode = s.mode || 'full', pick = s.pick || DEFCUSTOM, sel = s.sel || {};
    var q = s.q || '', qShown = q.trim(), form = s.form || EMPTY_FORM, errs = s.errs || {};
    var ALL = (s.rows || []).filter(function (c) { return !c.hidden; });
    var pairs = s.pairs || [];
    var isDupes = view === 'dupes';
    var cols = COLS.filter(function (c) { return mode === 'full' || pick[c.k]; });
    var inView = isDupes ? [] : ALL.filter(function (c) { return view === 'all' || c.f.indexOf(view) >= 0; });
    var list = inView.filter(function (c) { return matches(c, q); });
    var pairList = pairs.filter(function (p) { return matches(p.a, q) || matches(p.b, q); });
    var V = VIEWS.filter(function (v) { return v.k === view; })[0];
    // Demo totals per view, adjusted for the customer book, edits (e.g. made wholesale) and merges.
    var countOf = function (v) {
      if (v.k === 'dupes') return pairs.length;
      var n = v.n;
      (s.rows || []).forEach(function (r) {
        var now = !r.hidden && (v.k === 'all' || r.f.indexOf(v.k) >= 0);
        if (r.book) { if (now) n++; } else { var base = v.k === 'all' || r.baseF.indexOf(v.k) >= 0; n += (now ? 1 : 0) - (base ? 1 : 0); }
      });
      return Math.max(0, n);
    };
    var total = countOf(V);
    var selN = list.filter(function (c) { return sel[c.key]; }).length;
    var outN = qShown ? (isDupes ? pairList.length : list.length) : total;
    var cell = function (c, k) {
      var v = c[k], o = { al: 'left', fw: 400, color: '#334155', isBadge: false, isText: true, cls: '', v: v };
      if (k === 'spent') { o.v = v ? bdt(v) : '—'; o.al = 'right'; o.fw = 600; o.color = '#0f172a'; }
      if (k === 'due') { o.v = v ? bdt(v) : '—'; o.al = 'right'; o.fw = v ? 600 : 400; o.color = v ? 'var(--text-danger)' : 'var(--text-muted)'; }
      if (k === 'orders' || k === 'pts') { o.al = 'right'; o.v = typeof v === 'number' ? v.toLocaleString('en-IN') : v; }
      if (k === 'status' || k === 'level') { o.isBadge = true; o.isText = false; o.cls = k === 'status' ? SCLS[v] : LCLS[v]; }
      if (k === 'email' || k === 'signup' || k === 'last') o.color = '#64748b';
      return o;
    };
    var mkView = function (v) {
      var on = v.k === view, pi = PRIMARY.indexOf(v.k);
      return { k: v.k, label: v.label, count: countOf(v).toLocaleString('en-IN'), on: on, cBg: on ? 'rgba(0,48,135,.14)' : '#eef2f6',
        cls: (on ? 'chip on' : 'chip') + ' ac-c' + (pi + 1), mcls: 'ac-mi' + (pi >= 0 ? ' ac-m ac-m' + (pi + 1) : '') + (on ? ' on' : ''),
        pick: function () { self.setView(v.k); }, pickMenu: function () { self.pickFromMenu(v.k); } };
    };
    var moreOn = PRIMARY.indexOf(view) < 0;
    return {
      views: VIEWS.filter(function (v) { return PRIMARY.indexOf(v.k) >= 0; }).sort(function (a, b) { return PRIMARY.indexOf(a.k) - PRIMARY.indexOf(b.k); }).map(mkView),
      // "All customers" is always a chip, so it never needs a menu entry.
      moreViews: VIEWS.filter(function (v) { return v.k !== 'all'; }).map(mkView),
      moreOpen: !!s.moreOpen, moreOn: moreOn, moreCls: 'chip ac-more' + (moreOn ? ' on' : ''), moreLabel: moreOn ? V.label : 'More views',
      moreName: moreOn ? 'More views, showing ' + V.label : 'More views',
      toggleMore: self.toggleMore, onMoreKey: self.onMoreKey, moreWrap: self.moreWrap, moreBtn: self.moreBtn, moreList: self.moreList,
      q: q, typeQ: self.typeQ, clearQ: self.clearQ, showAll: self.showAll, hasQ: !!qShown,
      emptyTitle: qShown ? 'No customers match “' + qShown + '”' : isDupes ? 'No possible duplicates' : 'No customers in this view',
      emptyBody: qShown ? (view === 'all' ? 'Check the spelling, or search by name or mobile number.' : 'Nothing in “' + V.label + '” matches. Check the spelling or clear the search.') : isDupes ? 'No two customers share a mobile number or a near-identical name.' : 'Try another view to see more customers.',
      emptyAction: qShown ? 'Clear search' : 'Show all customers', emptyDo: qShown ? self.clearQ : self.showAll,
      addOpen: !!s.addOpen, openAdd: self.openAdd, closeAdd: self.closeAdd, submitAdd: self.submitAdd, typeField: self.typeField, form: form, toggleType: self.toggleType, errTypes: (s.errs || {}).types,
      errName: errs.name || '', errPhone: errs.phone || '', errCredit: errs.credit || '',
      modes: [{ k: 'full', l: 'Full view' }, { k: 'custom', l: 'Custom view' }].map(function (m) { var on = m.k === mode; return { l: m.l, on: on, bg: on ? '#003087' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ mode: m.k, colsOpen: m.k === 'custom' }); } }; }),
      isCustom: mode === 'custom', colsOpen: mode === 'custom' && !!s.colsOpen, toggleCols: function () { self.setState({ colsOpen: !s.colsOpen }); },
      colChips: COLS.map(function (c) { var on = !!pick[c.k]; return { label: c.l, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = assign({}, pick); p[c.k] = !on; self.setState({ pick: p }); } }; }),
      fOpen: !!s.fOpen, toggleF: function () { self.setState({ fOpen: !s.fOpen }); }, fBtnCls: s.fOpen ? 'btn soft sm' : 'btn line sm', hasF: !!s.fApplied, fCount: 3,
      clearF: function () { self.setState({ fApplied: false }); }, applyF: function () { self.setState({ fApplied: true, fOpen: false }); toast(self, 'Filters applied.'); },
      saveView: function () { self.setState({ fOpen: false, fApplied: true }); toast(self, 'Saved as a view. It now shows with the other views.'); },
      print: function () { toast(self, 'Opening a print-ready list of ' + outN.toLocaleString('en-IN') + ' customers with the columns you see.'); },
      csv: function () { toast(self, 'Downloading ' + (selN || outN).toLocaleString('en-IN') + ' customers as CSV — ' + (cols.length + 2) + ' columns.'); },
      heads: cols.map(function (c) { return { l: c.l, al: c.al || 'left' }; }),
      rows: list.map(function (c) { var on = !!sel[c.key]; return { key: c.key, href: hrefOf(c), wholesale: !!c.wholesale, name: c.name, phone: c.phone, initial: c.name.charAt(0).toUpperCase(), sel: on, bg: on ? '#f2f6fc' : 'transparent', rowCls: c.isNew ? 'row flash' : 'row', merged: c.mergedFrom ? 'Merged with ' + c.mergedFrom.join(', ') : '', cells: cols.map(function (k) { return cell(c, k.k); }), toggle: function () { var o = assign({}, sel); o[c.key] = !on; self.setState({ sel: o }); }, edit: function () { self.openEdit(c); } }; }),
      allSel: list.length > 0 && selN === list.length, toggleAll: function () { var o = {}; if (selN !== list.length) list.forEach(function (c) { o[c.key] = true; }); self.setState({ sel: o }); },
      // duplicates
      isDupes: isDupes, pairCount: pairs.length, showDupeNote: view === 'all' && !qShown && pairs.length > 0, goDupes: function () { self.setView('dupes'); },
      pairs: pairList.map(function (p) { return { id: p.id, why: p.why, a: sideOf(p.a), b: sideOf(p.b), merge: function () { self.openMerge(p); }, notDupe: function () { self.notDupe(p); } }; }),
      editOpen: !!s.editRow, editCust: s.editCust, editLocked: !!(s.editRow && s.editRow.book), closeEdit: self.closeEdit, saveEdit: self.saveEdit, editPhoneTaken: self.editPhoneTaken,
      mergeOpen: !!s.mergePair, closeMerge: self.closeMerge, confirmMerge: self.confirmMerge,
      mergeSides: s.mergePair ? [s.mergePair.a, s.mergePair.b].map(function (c) { var on = c.key === s.keepKey; return assign(sideOf(c), { key: c.key, on: on, pick: function () { self.setState({ keepKey: c.key }); } }); }) : [],
      mergeKeepName: s.mergePair ? (s.mergePair.a.key === s.keepKey ? s.mergePair.a : s.mergePair.b).name : '', mergeDropName: s.mergePair ? (s.mergePair.a.key === s.keepKey ? s.mergePair.b : s.mergePair.a).name : '',
      hasSel: selN > 0, selCount: selN,
      bulkSms: function () { toast(self, 'SMS composer opened for ' + selN + ' customers.'); }, bulkCoupon: function () { toast(self, 'A one-time coupon was assigned to ' + selN + ' customers.'); }, bulkTag: function () { toast(self, 'Tag added to ' + selN + ' customers.'); },
      perPage: s.perPage || '25', setPerPage: function (e) { self.setState({ perPage: e.target.value }); },
      empty: isDupes ? !pairList.length : !list.length, shown: isDupes ? pairList.length : list.length, total: total.toLocaleString('en-IN')
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
/* KPI cards: 5 across when there is room, then 3 + 2, then 2 + 2 + 1, then one column. No orphan card,
   and the label and sub-text get enough width to stay within two lines. */
/* View chips: the row keeps as many chips as fit and moves the rest into "More views". */
.ac-viewwrap{container-type:inline-size;position:relative;z-index:20}
.ac-views{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.ac-morewrap{position:relative}
.ac-more__lbl{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:30;min-width:260px;max-width:min(320px,calc(100vw - 48px));padding:6px;border:1px solid #e2e8f0;border-radius:var(--radius-xl);background:#fff;box-shadow:0 16px 40px -12px rgba(15,23,42,.28);display:flex;flex-direction:column;gap:2px}
.ac-mi{display:flex;align-items:center;gap:10px;width:100%;min-height:36px;padding:6px 10px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-align:left;cursor:pointer}
.ac-mi:hover,.ac-mi:focus-visible{background:#f1f5f9;color:#0f172a}
.ac-mi:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-2px}
.ac-mi.on{color:#003087;background:rgba(0,48,135,.08)}
.ac-mi__chk{width:16px;flex:none;display:inline-flex}
.ac-mi__n{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ac-m{display:none}
@container (max-width:1219px){.ac-c6{display:none}.ac-m6{display:flex}}
@container (max-width:1049px){.ac-c5{display:none}.ac-m5{display:flex}}
@container (max-width:879px){.ac-c4{display:none}.ac-m4{display:flex}}
@container (max-width:709px){.ac-c3{display:none}.ac-m3{display:flex}}
@container (max-width:519px){.ac-c2{display:none}.ac-m2{display:flex}}
/* Table: the customer cell is two single lines, never wrapped. */
.ac-th-cust{min-width:220px}
.ac-cust{display:flex;align-items:center;gap:12px;min-width:196px;max-width:300px;text-decoration:none;color:inherit}
.ac-cust__txt{min-width:0;flex:1 1 auto}
.ac-cust__name,.ac-cust__phone{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ac-cust:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px;border-radius:var(--radius-lg)}
.ac-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 16px;border-bottom:1px solid #e2e8f0}
/* phones: the list is cards, so the column view switch is not needed */
@media (max-width:640px){.ac-toolbar{padding:12px}.ac-toolbar>div:has(>button[aria-pressed]){display:none!important}.ac-toolbar>span[style*="flex-grow"]{display:none}}
.ac-search{position:relative;flex:1 1 240px;max-width:360px;min-width:200px}
.btn[disabled]{opacity:.5;cursor:not-allowed}
.ac-field{display:flex;flex-direction:column}
.ac-err{display:flex;align-items:flex-start;gap:6px;color:var(--text-danger)!important}
.ac-money{position:relative}
.ac-money span{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm)}
.ac-money input{padding-left:30px}
/* Possible duplicates */
.ac-dnote{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border-subtle);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.ac-pairs{list-style:none;margin:0;padding:0}
.ac-pair{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 16px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border-subtle)}
.ac-pair__why{grid-column:1 / -1}
.ac-pair__sides{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ac-pair__side{display:flex;align-items:center;gap:10px;min-width:0;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.ac-pair__side:hover{border-color:var(--primary);color:inherit;text-decoration:none}
.ac-pair__name{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ac-pair__sub{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis}
.ac-pair__acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.ac-avatar{width:38px;height:38px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium);display:flex;align-items:center;justify-content:center}
.ac-mg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ac-mg__opt{display:flex;flex-direction:column;gap:12px;padding:14px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);cursor:pointer;min-width:0}
.ac-mg__opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ac-mg__facts{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0;font-size:var(--text-sm)}
.ac-mg__facts dt{color:var(--text-muted)}
.ac-mg__facts dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
@media (max-width:760px){.ac-pair{grid-template-columns:minmax(0,1fr)}.ac-pair__sides,.ac-mg{grid-template-columns:minmax(0,1fr)}.ac-pair__acts{justify-content:flex-start}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class AllCustomersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllCustomers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Customers" page="All customers" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="All customers" />
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flexGrow: "1", flexBasis: "260px", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Every person who signed up or bought from you. Pick a ready view, or filter on anything.</div>
                <button type="button" className="btn solid" onClick={v.openAdd} aria-haspopup="dialog">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add customer</span>
                </button>
              </div>
              <div className="ac-viewwrap">
                <div className="ac-views" role="group" aria-label="Customer views">
                  {__list(v.views).map((vw) => (
                    <button key={vw.k} type="button" className={vw.cls} aria-pressed={vw.on} onClick={vw.pick}>{vw.label}<span style={__sx(`min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--radius-full); background: ${vw.cBg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{vw.count}</span></button>
                  ))}
                  <div className="ac-morewrap" ref={v.moreWrap} onKeyDown={v.onMoreKey}>
                    <button type="button" ref={v.moreBtn} id="ac-more-btn" className={v.moreCls} aria-haspopup="menu" aria-expanded={v.moreOpen} aria-controls="ac-more-menu" aria-label={v.moreName} onClick={v.toggleMore}>
                      <span className="ac-more__lbl">{v.moreLabel}</span>
                      <__Icon name="chevron-down" width="16" height="16" aria-hidden="true" />
                    </button>
                    {v.moreOpen ? (
                      <div className="ac-menu fade" id="ac-more-menu" role="menu" aria-labelledby="ac-more-btn" ref={v.moreList}>
                        {__list(v.moreViews).map((vw) => (
                          <button key={vw.k} type="button" role="menuitemradio" aria-checked={vw.on} tabIndex={-1} className={vw.mcls} onClick={vw.pickMenu}>
                            <span className="ac-mi__chk">{vw.on ? <__Icon name="check" width="16" height="16" aria-hidden="true" /> : null}</span>
                            <span>{vw.label}</span>
                            <span className="ac-mi__n">{vw.count}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="ac-toolbar">
                  <label className="ac-search">
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input id="ac-search" className="inp" type="search" value={v.q} onChange={v.typeQ} placeholder="Search by name or phone" aria-label="Search customers by name or phone" autoComplete="off" style={{ paddingLeft: "44px" }} />
                  </label>
                  <button type="button" className={v.fBtnCls} onClick={v.toggleF}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Filters</span>
                    {v.hasF ? (<>
                      <span style={{ minWidth: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{v.fCount}</span>
                    </>) : null}
                  </button>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                    {__list(v.modes).map((m, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={m?.pick} aria-pressed={m?.on} style={__sx(`height: 34px; padding: 0 14px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""};`)}>{m?.l}</button>
                      </React.Fragment>))}
                  </div>
                  {v.isCustom ? (<>
                    <button type="button" className="btn line sm" onClick={v.toggleCols}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="M15 3v18" />
                      </svg>
                      <span>Columns</span>
                    </button>
                  </>) : null}
                  <span style={{ flexGrow: "1" }} />
                  <__PhoneMore>
                  <button type="button" className="btn line sm" onClick={v.print}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                    <span>Print</span>
                  </button>
                  <button type="button" className="btn line sm" onClick={v.csv}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M12 15V3" />
                    </svg>
                    <span>Download CSV</span>
                  </button>
                  </__PhoneMore>
                </div>
                {v.fOpen ? (<>
                  <div className="fade gc-cols-4" style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Signed up</span>
                      <select className="inp" aria-label="Signed up">
                        <option>Any time</option>
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>This year</option>
                        <option>Pick dates</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Last order</span>
                      <select className="inp" aria-label="Last order">
                        <option>Any time</option>
                        <option>Today</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>More than 60 days ago</option>
                        <option>Never ordered</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Total spent</span>
                      <select className="inp" aria-label="Total spent">
                        <option>Any amount</option>
                        <option>Under ৳1,000</option>
                        <option>৳1,000 – ৳10,000</option>
                        <option>৳10,000 – ৳50,000</option>
                        <option>Above ৳50,000</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Number of orders</span>
                      <select className="inp" aria-label="Number of orders">
                        <option>Any</option>
                        <option>0 orders</option>
                        <option>1 order</option>
                        <option>2–4 orders</option>
                        <option>5+ orders</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">City or area</span>
                      <select className="inp" aria-label="City or area">
                        <option>All</option>
                        <option>Dhaka</option>
                        <option>Chattogram</option>
                        <option>Sylhet</option>
                        <option>Khulna</option>
                        <option>Rajshahi</option>
                        <option>Outside Dhaka</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Member level</span>
                      <select className="inp" aria-label="Member level">
                        <option>All</option>
                        <option>Member</option>
                        <option>Silver</option>
                        <option>Gold</option>
                        <option>Platinum</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Came from</span>
                      <select className="inp" aria-label="Came from">
                        <option>All</option>
                        <option>Facebook ad</option>
                        <option>Instagram</option>
                        <option>Google</option>
                        <option>TikTok</option>
                        <option>Invite a friend</option>
                        <option>Shop counter (POS)</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Paid with</span>
                      <select className="inp" aria-label="Paid with">
                        <option>Any</option>
                        <option>Cash on delivery</option>
                        <option>bKash</option>
                        <option>Nagad</option>
                        <option>Card</option>
                        <option>Wallet</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Account status</span>
                      <select className="inp" aria-label="Account status">
                        <option>All</option>
                        <option>Active</option>
                        <option>Suspended</option>
                        <option>COD blocked</option>
                        <option>Gateway blocked</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Has</span>
                      <select className="inp" aria-label="Has">
                        <option>Anything</option>
                        <option>Abandoned cart</option>
                        <option>Unused coupon</option>
                        <option>Points expiring</option>
                        <option>Open support ticket</option>
                        <option>Items in wishlist</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Tag</span>
                      <select className="inp" aria-label="Tag">
                        <option>Any</option>
                        <option>VIP</option>
                        <option>Wholesale</option>
                        <option>Influencer</option>
                        <option>Staff</option>
                        <option>Fraud watch</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Birthday</span>
                      <select className="inp" aria-label="Birthday">
                        <option>Any</option>
                        <option>This week</option>
                        <option>This month</option>
                      </select>
                    </label>
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn line sm" onClick={v.clearF}>Clear</button>
                      <button type="button" className="btn solid sm" onClick={v.applyF}>Show customers</button>
                      <button type="button" className="btn soft sm" onClick={v.saveView}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <span>Save as a view</span>
                      </button>
                    </div>
                  </div>
                </>) : null}
                {v.colsOpen ? (<>
                  <div className="fade" style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="lbl">Show columns:</span>
                    {__list(v.colChips).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "36px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.hasSel ? (<>
                  <div className="fade" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#003087", color: "#fff", fontSize: "var(--text-sm)" }}>
                    <b>{v.selCount} selected</b>
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkSms}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                      <span>Send SMS</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkCoupon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M9 9h.01" />
                        <path d="m15 9-6 6" />
                        <path d="M15 15h.01" />
                      </svg>
                      <span>Assign coupon</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.bulkTag}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                        <circle cx="7.5" cy="7.5" r="1" />
                      </svg>
                      <span>Add tag</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={v.csv}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M12 15V3" />
                      </svg>
                      <span>Export</span>
                    </button>
                  </div>
                </>) : null}
                {v.showDupeNote ? (
                  <div className="ac-dnote" role="note">
                    <__Icon name="users" width="18" height="18" aria-hidden="true" style={{ flex: "none", color: "var(--text-warning)" }} />
                    <span style={{ flexGrow: "1" }}>{v.pairCount === 1 ? '1 pair of customers looks like the same person.' : v.pairCount + ' pairs of customers look like the same person.'} Merge them to keep one record.</span>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={v.goDupes}>Review duplicates</button>
                  </div>
                ) : null}
                {v.empty ? (
                  <__EmptyState title={v.emptyTitle} body={v.emptyBody} actionLabel={v.emptyAction} onAction={v.emptyDo} />
                ) : v.isDupes ? (
                  <ul className="ac-pairs" aria-label="Possible duplicate customers">
                    {v.pairs.map((p) => (
                      <li key={p.id} className="ac-pair">
                        <div className="ac-pair__why"><span className="gc-badge gc-badge--warning">{p.why}</span></div>
                        <div className="ac-pair__sides">
                          {[p.a, p.b].map((c, i) => (
                            <__Link key={i} href={c.href} className="ac-pair__side">
                              <span className="ac-avatar" aria-hidden="true">{c.initial}</span>
                              <span style={{ minWidth: "0" }}>
                                <span className="ac-pair__name">{c.name}</span>
                                <span className="mono ac-pair__sub">{c.phone}</span>
                                <span className="ac-pair__sub">{c.orders} orders · {c.spent} spent · {c.types}</span>
                              </span>
                            </__Link>
                          ))}
                        </div>
                        <div className="ac-pair__acts">
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={p.notDupe}>Not the same</button>
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={p.merge} aria-haspopup="dialog">Merge…</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                <div className="gc-table-wrap" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th" style={{ width: "44px" }}>
                          <input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} style={{ width: "18px", height: "18px" }} />
                        </th>
                        <th className="th ac-th-cust" scope="col">Customer</th>
                        {__list(v.heads).map((h, $index) => (<React.Fragment key={$index}>
                            <th className="th" scope="col" style={__sx(`text-align: ${h?.al ?? ""};`)}>{h?.l}</th>
                          </React.Fragment>))}
                        <th className="th" scope="col"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r) => (<React.Fragment key={r.key}>
                          <tr className={r?.rowCls} style={__sx(`background: ${r?.bg ?? ""};`)}>
                            <td className="td">
                              <input type="checkbox" aria-label={`Select ${r?.name ?? ""}`} checked={r?.sel} onChange={r?.toggle} style={{ width: "18px", height: "18px" }} />
                            </td>
                            <td className="td">
                              <__Link href={r?.href} className="ac-cust" title={r?.merged ? r.name + ' · ' + r.merged : r?.name}>
                                <span aria-hidden="true" style={{ width: "38px", height: "38px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#e0f3fb", color: "#003087", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>{r?.initial}</span>
                                <span className="ac-cust__txt">
                                  <span className="ac-cust__name" style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.name}</span>
                                  <span className="mono ac-cust__phone" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r?.phone}</span>
                                </span>
                              </__Link>
                            </td>
                            {__list(r?.cells).map((cl, $index) => (<React.Fragment key={$index}>
                                <td className="td" style={__sx(`text-align: ${cl?.al ?? ""}; font-weight: ${cl?.fw ?? ""}; color: ${cl?.color ?? ""}; white-space: nowrap;`)}>
                                  {cl?.isBadge ? (<>
                                    <span className={cl?.cls}>{cl?.v}</span>
                                  </>) : null}
                                  {cl?.isText ? (<>{cl?.v}</>) : null}
                                </td>
                              </React.Fragment>))}
                            <td className="td" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                              <button type="button" className="gc-iconbtn" onClick={r.edit} aria-label={`Edit ${r.name}`} title="Edit" aria-haspopup="dialog" style={{ verticalAlign: "middle", marginRight: "4px" }}><__Icon name="pencil" width="16" height="16" aria-hidden="true" /></button>
                              <__Link href={r?.href} className="btn soft sm" aria-label={`Open ${r?.name ?? ""}`}>Open <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6" />
</svg></__Link>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                  <span style={{ flexGrow: "1" }} role="status" aria-live="polite">{v.isDupes ? (<>Showing {v.shown} possible {v.shown === 1 ? 'duplicate pair' : 'duplicate pairs'}</>) : v.hasQ ? (<>Showing {v.shown} matching “{v.q.trim()}”</>) : (<>Showing {v.shown} of {v.total} customers</>)}</span>
                  <label htmlFor="ac-perpage">Rows per page</label>
                  <select id="ac-perpage" className="inp" value={v.perPage} onChange={v.setPerPage} style={{ width: "90px", height: "36px" }}>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <button type="button" className="btn line sm" aria-label="Previous page" title="This is the first page" disabled>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="btn line sm" aria-label="Next page" title="All demo customers fit on one page" disabled>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </section>
              <__Dialog open={v.addOpen} title="Add customer" onClose={v.closeAdd} width={480} footer={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeAdd}>Cancel</button>
                <button type="submit" form="ac-add-form" className="gc-btn gc-btn--solid">Save customer</button>
              </>}>
                <form id="ac-add-form" noValidate onSubmit={v.submitAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="ac-field">
                    <label className="gc-label" htmlFor="ac-add-name">Full name <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                    <input id="ac-add-name" name="name" data-autofocus="" className={v.errName ? "gc-input gc-input--error" : "gc-input"} value={v.form?.name} onChange={v.typeField} required aria-required="true" aria-invalid={v.errName ? "true" : "false"} aria-describedby={v.errName ? "ac-add-name-err" : undefined} autoComplete="off" maxLength={80} />
                    {v.errName ? (<p id="ac-add-name-err" className="gc-help gc-help--error ac-err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }} /><span>{v.errName}</span></p>) : null}
                  </div>
                  <div className="ac-field">
                    <label className="gc-label" htmlFor="ac-add-phone">Mobile number <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                    <input id="ac-add-phone" name="phone" type="tel" inputMode="tel" className={v.errPhone ? "gc-input gc-input--error mono" : "gc-input mono"} value={v.form?.phone} onChange={v.typeField} placeholder="01XXXXXXXXX" required aria-required="true" aria-invalid={v.errPhone ? "true" : "false"} aria-describedby={v.errPhone ? "ac-add-phone-err" : "ac-add-phone-help"} autoComplete="off" maxLength={20} />
                    {v.errPhone ? (<p id="ac-add-phone-err" className="gc-help gc-help--error ac-err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }} /><span>{v.errPhone}</span></p>) : (<p id="ac-add-phone-help" className="gc-help">11 digits, starting with 01.</p>)}
                  </div>
                  <div className="ac-field">
                    <label className="gc-label" htmlFor="ac-add-area">Address <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" }}>(optional)</span></label>
                    <textarea id="ac-add-area" name="area" rows="2" className="gc-input" value={v.form?.area} onChange={v.typeField} placeholder="House, road, area and city" autoComplete="off" maxLength={160} />
                  </div>
                  <fieldset className="ac-field" style={{ border: "0", margin: "0", padding: "0", minWidth: "0" }} aria-describedby={v.errTypes ? "ac-add-type-err" : "ac-add-type-help"}>
                    <legend className="gc-label">Customer type <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></legend>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {CUST_TYPES.map((t) => { const on = (v.form?.types || []).indexOf(t) >= 0; return (
                        <label key={t} style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 14px", border: on ? "1px solid var(--primary)" : "1px solid var(--border-field)", borderRadius: "var(--radius-lg)", background: on ? "var(--fill-primary-soft)" : "transparent", fontSize: "var(--text-sm)", color: "var(--text-heading)", cursor: "pointer" }}>
                          <input id={"ac-add-type-" + t} type="checkbox" className="gc-check" checked={on} onChange={() => v.toggleType(t)} />{t}
                        </label>); })}
                      <button type="button" className="gc-btn gc-btn--flat" aria-pressed={(v.form?.types || []).length === 3} onClick={() => v.toggleType('all')}>All three</button>
                    </div>
                    {v.errTypes ? (<p id="ac-add-type-err" className="gc-help gc-help--error ac-err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }} /><span>{v.errTypes}</span></p>) : (<p id="ac-add-type-help" className="gc-help">Pick every way this customer buys from you.</p>)}
                  </fieldset>
                  {(v.form?.types || []).indexOf('Wholesale') >= 0 ? (<>
                    <div className="ac-field">
                      <label className="gc-label" htmlFor="ac-add-tier">Wholesale price list</label>
                      <select id="ac-add-tier" name="tier" className="gc-input gc-select" value={v.form?.tier || 'A'} onChange={v.typeField}>
                        {Object.keys(PRICE_TIERS).map((k) => (<option key={k} value={k}>{PRICE_TIERS[k].label} · {PRICE_TIERS[k].off}% below retail</option>))}
                      </select>
                      <p className="gc-help">New sale loads these prices by itself when this customer is chosen.</p>
                    </div>
                    <div className="ac-field">
                      <label className="gc-label" htmlFor="ac-add-credit">Credit limit</label>
                      <div className="ac-money"><span aria-hidden="true">৳</span><input id="ac-add-credit" name="credit" type="number" min="0" step="1000" inputMode="numeric" className={v.errCredit ? "gc-input gc-input--error" : "gc-input"} value={v.form?.credit || ''} onChange={v.typeField} placeholder="0" aria-invalid={v.errCredit ? "true" : "false"} aria-describedby={v.errCredit ? "ac-add-credit-err" : "ac-add-credit-help"} /></div>
                      {v.errCredit ? (<p id="ac-add-credit-err" className="gc-help gc-help--error ac-err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }} /><span>{v.errCredit}</span></p>) : (<p id="ac-add-credit-help" className="gc-help">The most this customer can owe you. 0 means no limit.</p>)}
                    </div>
                  </>) : null}
                </form>
              </__Dialog>
              <CustomerEditDialog open={v.editOpen} customer={v.editCust} phoneLocked={v.editLocked} phoneTaken={v.editPhoneTaken} onSave={v.saveEdit} onClose={v.closeEdit} />
              <__Dialog open={v.mergeOpen} title="Merge duplicate customers" onClose={v.closeMerge} width={640} footer={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeMerge}>Cancel</button>
                <button type="button" className="gc-btn gc-btn--solid" onClick={v.confirmMerge}>Keep {v.mergeKeepName}</button>
              </>}>
                <fieldset style={{ border: "0", margin: "0", padding: "0", minWidth: "0", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <legend className="gc-label" style={{ marginBottom: "10px" }}>Which record do you keep?</legend>
                  <div className="ac-mg">
                    {v.mergeSides.map((c) => (
                      <label key={c.key} className={'ac-mg__opt' + (c.on ? ' is-on' : '')}>
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input type="radio" name="ac-keep" className="gc-check" checked={c.on} onChange={c.pick} />
                          <span style={{ minWidth: "0" }}>
                            <span className="ac-pair__name">{c.name}</span>
                            <span className="mono ac-pair__sub">{c.phone}</span>
                          </span>
                        </span>
                        <dl className="ac-mg__facts">
                          <dt>Orders</dt><dd>{c.orders}</dd>
                          <dt>Spent</dt><dd>{c.spent}</dd>
                          <dt>Due</dt><dd style={c.hasDue ? { color: "var(--text-danger)", fontWeight: "var(--weight-semibold)" } : undefined}>{c.due}</dd>
                          <dt>Buys</dt><dd>{c.types}</dd>
                          <dt>Came from</dt><dd>{c.src}</dd>
                          <dt>Last order</dt><dd>{c.last}</dd>
                        </dl>
                      </label>
                    ))}
                  </div>
                  <p className="gc-help" style={{ margin: "0" }}>{v.mergeDropName} is hidden from your lists. Their orders, spend and due are added to {v.mergeKeepName}.</p>
                </fieldset>
              </__Dialog>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
