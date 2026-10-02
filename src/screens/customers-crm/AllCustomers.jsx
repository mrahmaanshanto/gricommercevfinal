'use client';
// Generated from design/templates/customers-crm/AllCustomers.dc.html by scripts/convert-design.mjs.
// AllCustomers — Customers, laid out like Shopify's Customers list (components/ui/IndexKit.jsx): title row, then one
// card with the views as tabs (the rest under More views), search and filter pills, bulk actions and a compact table
// (customer, status, location, orders, amount spent, due). Extra columns are picked in Columns; edits, merges and the
// customer book are kept in this browser.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { addCustomer, getCustomers, tierOf, PRICE_TIERS, updateCustomer, mergeCustomers, phoneDigits } from '@/lib/customers';
import { getInvoices } from '@/lib/invoices';
import { getDemoEdits, saveDemoEdit, getMerges, addMerge, getNotDupes, addNotDupe, removeFromBook } from '@/lib/customerEdits';
import CustomerEditDialog from './CustomerEditDialog';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Pager, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
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
// Columns of the list, in order. The main ones always show (Shopify's Customers list: customer, status, location,
// orders, amount spent, and what they still owe); the extra ones are picked in Columns.
var COLS = [
  { k: 'status', l: 'Status' }, { k: 'city', l: 'Location' }, { k: 'email', l: 'Email', extra: true }, { k: 'signup', l: 'Signed up', extra: true },
  { k: 'last', l: 'Last order', extra: true }, { k: 'level', l: 'Level', extra: true }, { k: 'pts', l: 'Points', al: 'right', extra: true }, { k: 'src', l: 'Came from', extra: true },
  { k: 'orders', l: 'Orders', al: 'right' }, { k: 'spent', l: 'Amount spent', al: 'right' }, { k: 'due', l: 'Due', al: 'right' }
];
var STONE = { 'Active': 'success', 'Suspended': 'error', 'COD blocked': 'warning' };
var LTONE = { Member: 'neutral', Silver: 'neutral', Gold: 'warning', Platinum: 'primary' };
// Views shown as tabs, in priority order; the rest are in "More views" (the one picked from there shows as a tab).
var PRIMARY = ['all', 'wholesale', 'signToday', 'orderToday', 'week', 'repeat', 'big'];
var CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Outside Dhaka'];
var NO_PILLS = { fCity: '', fStatus: '', fLevel: '', fSrc: '' };
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

  // ---- search ----
  typeQ = (e) => { this.setState({ q: e.target.value, sel: {} }); };
  showAll = () => { this.setState({ q: '', pills: NO_PILLS, fApplied: false, find: false }); this.setView('all'); };

  // ---- views (stored in the URL as ?view=<key>) ----
  setView = (k) => {
    this.setState({ view: k, sel: {} });
    try { var u = new URL(window.location.href); if (k === 'all') u.searchParams.delete('view'); else u.searchParams.set('view', k); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); } catch (e) { /* no URL access */ }
  };

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
    var view = s.view || 'all', pick = s.pick || {}, sel = s.sel || {};
    var q = s.q || '', qShown = q.trim(), form = s.form || EMPTY_FORM, errs = s.errs || {};
    var pills = assign(assign({}, NO_PILLS), s.pills || {});
    var pillCount = (pills.fCity ? 1 : 0) + (pills.fStatus ? 1 : 0) + (pills.fLevel ? 1 : 0) + (pills.fSrc ? 1 : 0);
    var ALL = (s.rows || []).filter(function (c) { return !c.hidden; });
    var pairs = s.pairs || [];
    var isDupes = view === 'dupes';
    var cols = COLS.filter(function (c) { return !c.extra || pick[c.k]; });
    var inView = isDupes ? [] : ALL.filter(function (c) { return view === 'all' || c.f.indexOf(view) >= 0; });
    var pillOk = function (c) {
      return (!pills.fCity || (pills.fCity === 'Dhaka' ? /Dhaka/.test(c.city) && c.city !== 'Outside Dhaka' : c.city.indexOf(pills.fCity) >= 0))
        && (!pills.fStatus || c.status === pills.fStatus) && (!pills.fLevel || c.level === pills.fLevel) && (!pills.fSrc || String(c.src).indexOf(pills.fSrc) >= 0);
    };
    var list = inView.filter(function (c) { return matches(c, q) && pillOk(c); });
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
    var selRows = list.filter(function (c) { return sel[c.key]; });
    var selN = selRows.length;
    var filtered = !!qShown || pillCount > 0;
    var outN = filtered ? (isDupes ? pairList.length : list.length) : total;
    var cell = function (c, k) {
      var v = c[k];
      if (k === 'spent') return { v: v ? bdt(v) : '—', cls: 'ix-num' };
      if (k === 'due') return { v: v ? bdt(v) : '—', cls: 'ix-num' + (v ? ' ix-bad' : ' ix-muted') };
      if (k === 'orders' || k === 'pts') return { v: typeof v === 'number' ? v.toLocaleString('en-IN') : v, cls: 'ix-num' };
      if (k === 'status') return { badge: STONE[v] || 'neutral', v: v };
      if (k === 'level') return { badge: LTONE[v] || 'neutral', v: v };
      if (k === 'email' || k === 'city' || k === 'src') return { v: v, cls: 'ix-muted', trunc: true };
      if (k === 'signup' || k === 'last') return { v: v, cls: 'ix-muted' };
      return { v: v, cls: '' };
    };
    // tabs: the main views, the view picked from More views, and Possible duplicates while there are any
    var tabKeys = PRIMARY.concat(PRIMARY.indexOf(view) < 0 && view !== 'dupes' ? [view] : []).concat(pairs.length || isDupes ? ['dupes'] : []);
    var tabs = tabKeys.map(function (k) { var v = VIEWS.filter(function (x) { return x.k === k; })[0]; return { key: k, id: 'ac-tab-' + k, label: v.label, count: countOf(v).toLocaleString('en-IN'), on: k === view, onClick: function () { self.setView(k); } }; });
    var moreViews = VIEWS.filter(function (v) { return tabKeys.indexOf(v.k) < 0; }).map(function (v) { return { label: v.label + ' · ' + countOf(v).toLocaleString('en-IN'), onClick: function () { self.setView(v.k); } }; });
    var setPill = function (k) { return function (e) { var o = assign({}, pills); o[k] = e.target.value; self.setState({ pills: o, sel: {} }); }; };
    var clearAll = function () { self.setState({ q: '', pills: NO_PILLS, fApplied: false, sel: {} }); };
    return {
      tabs: tabs, moreViews: moreViews,
      q: q, typeQ: self.typeQ, hasQ: !!qShown,
      find: !!(s.find || qShown || pillCount), openFind: function () { self.setState({ find: true }); },
      closeFind: function () { self.setState({ find: false, q: '', pills: NO_PILLS, fApplied: false, sel: {} }); },
      pills: pills, setCity: setPill('fCity'), setStatus: setPill('fStatus'), setLevel: setPill('fLevel'), setSrc: setPill('fSrc'), cities: CITIES,
      hasFilters: filtered || !!s.fApplied, clearAll: clearAll,
      emptyTitle: qShown ? 'No customers match “' + qShown + '”' : isDupes ? 'No possible duplicates' : 'No customers in this view',
      emptyAction: filtered ? 'Clear search' : 'Show all customers', emptyDo: filtered ? clearAll : self.showAll,
      addOpen: !!s.addOpen, openAdd: self.openAdd, closeAdd: self.closeAdd, submitAdd: self.submitAdd, typeField: self.typeField, form: form, toggleType: self.toggleType, errTypes: (s.errs || {}).types,
      errName: errs.name || '', errPhone: errs.phone || '', errCredit: errs.credit || '',
      // Columns: the extra facts a merchant may want in the list
      colsOpen: !!s.colsOpen, openCols: function () { self.setState({ colsOpen: true }); }, closeCols: function () { self.setState({ colsOpen: false }); },
      extraOn: COLS.some(function (c) { return c.extra && pick[c.k]; }),
      colChips: COLS.filter(function (c) { return c.extra; }).map(function (c) { var on = !!pick[c.k]; return { label: c.l, on: on, pick: function () { var p = assign({}, pick); p[c.k] = !on; self.setState({ pick: p }); } }; }),
      showAllCols: function () { var p = {}; COLS.forEach(function (c) { if (c.extra) p[c.k] = true; }); self.setState({ pick: p }); },
      hideExtraCols: function () { self.setState({ pick: {} }); },
      // More filters (dialog)
      fOpen: !!s.fOpen, openF: function () { self.setState({ fOpen: true }); }, closeF: function () { self.setState({ fOpen: false }); }, hasF: !!s.fApplied,
      clearF: function () { self.setState({ fApplied: false, fOpen: false }); }, applyF: function () { self.setState({ fApplied: true, fOpen: false }); uiToast('Filters applied.'); },
      saveView: function () { self.setState({ fOpen: false, fApplied: true }); uiToast('Saved as a view. It now shows with the other views.'); },
      print: function () { uiToast('Opening a print-ready list of ' + outN.toLocaleString('en-IN') + ' customers with the columns you see.'); },
      csv: function () { uiToast('Downloading ' + (selN || outN).toLocaleString('en-IN') + ' customers as CSV — ' + (cols.length + 2) + ' columns.'); },
      heads: cols.map(function (c) { return { k: c.k, l: c.l, al: c.al || 'left' }; }),
      rows: list.map(function (c) { var on = !!sel[c.key], href = hrefOf(c); return { key: c.key, href: href, wholesale: !!c.wholesale, name: c.name, city: c.city, orders: c.orders, spent: c.spent ? bdt(c.spent) : '—', due: c.due ? bdt(c.due) : '', status: c.status, statusTone: STONE[c.status] || 'neutral', sel: on, isNew: !!c.isNew, merged: c.mergedFrom ? 'Merged with ' + c.mergedFrom.join(', ') : '',
        cells: cols.map(function (k) { return assign({ k: k.k }, cell(c, k.k)); }),
        onRowClick: function (e) { if (e.target.closest('a,button,input,label,select')) return; navigate(href); },
        toggle: function () { var o = assign({}, sel); o[c.key] = !on; self.setState({ sel: o }); } }; }),
      allSel: list.length > 0 && selN === list.length, toggleAll: function () { var o = {}; if (selN !== list.length) list.forEach(function (c) { o[c.key] = true; }); self.setState({ sel: o }); },
      clearSel: function () { self.setState({ sel: {} }); },
      editSel: function () { if (selN === 1) self.openEdit(selRows[0]); else uiToast('Select one customer to edit.', { tone: 'info' }); },
      // duplicates
      isDupes: isDupes,
      pairs: pairList.map(function (p) { return { id: p.id, why: p.why, a: sideOf(p.a), b: sideOf(p.b), merge: function () { self.openMerge(p); }, notDupe: function () { self.notDupe(p); } }; }),
      editOpen: !!s.editRow, editCust: s.editCust, editLocked: !!(s.editRow && s.editRow.book), closeEdit: self.closeEdit, saveEdit: self.saveEdit, editPhoneTaken: self.editPhoneTaken,
      mergeOpen: !!s.mergePair, closeMerge: self.closeMerge, confirmMerge: self.confirmMerge,
      mergeSides: s.mergePair ? [s.mergePair.a, s.mergePair.b].map(function (c) { var on = c.key === s.keepKey; return assign(sideOf(c), { key: c.key, on: on, pick: function () { self.setState({ keepKey: c.key }); } }); }) : [],
      mergeKeepName: s.mergePair ? (s.mergePair.a.key === s.keepKey ? s.mergePair.a : s.mergePair.b).name : '', mergeDropName: s.mergePair ? (s.mergePair.a.key === s.keepKey ? s.mergePair.b : s.mergePair.a).name : '',
      hasSel: selN > 0, selCount: selN,
      bulkSms: function () { uiToast('SMS composer opened for ' + selN + ' customers.'); }, bulkCoupon: function () { uiToast('A one-time coupon was assigned to ' + selN + ' customers.'); }, bulkTag: function () { uiToast('Tag added to ' + selN + ' customers.'); },
      empty: isDupes ? !pairList.length : !list.length,
      countLabel: isDupes ? 'Showing ' + pairList.length + ' possible ' + (pairList.length === 1 ? 'duplicate pair' : 'duplicate pairs')
        : filtered ? 'Showing ' + list.length + (qShown ? ' matching “' + qShown + '”' : ' customers') : 'Showing ' + list.length + ' of ' + total.toLocaleString('en-IN') + ' customers',
      caption: (V ? V.label : 'All customers') + ', ' + list.length + ' shown'
    };
  }
}

// ---- styles ----

const CSS = `
.ac-cust{display:inline-flex;align-items:center;gap:6px;max-width:260px}
.ac-cust>a{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ac-trunc{display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.ix-table tr.is-new td{animation:acNew 900ms ease-out}
@keyframes acNew{from{background:var(--fill-success-soft)}to{background:transparent}}
.ac-pitem-new{animation:acNew 900ms ease-out}
/* Possible duplicates */
.ac-pairs{margin:0;padding:0;list-style:none}
.ac-pair{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--space-2) var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ac-pair:last-child{border-bottom:0}
.ac-pair__why{grid-column:1 / -1}
.ac-pair__sides{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.ac-pair__side{display:flex;flex-direction:column;min-width:0;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.ac-pair__side:hover{border-color:var(--primary);color:inherit;text-decoration:none}
.ac-pair__name{display:block;overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.ac-pair__sub{display:block;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis}
.ac-pair__acts{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
.ac-mono{font-family:var(--font-data)}
/* dialogs */
.ac-form{display:flex;flex-direction:column;gap:var(--space-3)}
.ac-field{display:flex;flex-direction:column}
.ac-err{display:flex;align-items:flex-start;gap:6px;color:var(--text-danger)!important}
.ac-types{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ac-type{display:inline-flex;align-items:center;gap:var(--space-2);height:var(--control-height);padding:0 var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.ac-type.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ac-money{position:relative}
.ac-money span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm)}
.ac-money input{padding-left:28px}
.ac-mgset{display:flex;flex-direction:column;gap:var(--space-3);min-width:0;margin:0;padding:0;border:0}
.ac-mg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ac-mg__opt{display:flex;flex-direction:column;gap:var(--space-3);min-width:0;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.ac-mg__opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ac-mg__head{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.ac-mg__facts{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-3);margin:0;font-size:var(--text-sm)}
.ac-mg__facts dt{color:var(--text-muted)}
.ac-mg__facts dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
.ac-colchips{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ac-fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
/* phones: More views is an icon and Columns is hidden (the phone list has no columns) */
@media (max-width:640px){.ac-views .ix-btn{width:32px;padding:0}.ac-views .ix-btn>span,.ac-views .ix-btn>svg:last-child{display:none}.ac-colbtn{display:none}}
@media (max-width:760px){.ac-pair{grid-template-columns:minmax(0,1fr)}.ac-pair__sides,.ac-mg,.ac-fgrid{grid-template-columns:minmax(0,1fr)}.ac-pair__acts{justify-content:flex-start}}
`;

// ---- markup ----

const FILTERS_MORE = [
  ['Signed up', ['Any time', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This year', 'Pick dates']],
  ['Last order', ['Any time', 'Today', 'Last 7 days', 'Last 30 days', 'More than 60 days ago', 'Never ordered']],
  ['Total spent', ['Any amount', 'Under ৳1,000', '৳1,000 – ৳10,000', '৳10,000 – ৳50,000', 'Above ৳50,000']],
  ['Number of orders', ['Any', '0 orders', '1 order', '2–4 orders', '5+ orders']],
  ['Paid with', ['Any', 'Cash on delivery', 'bKash', 'Nagad', 'Card', 'Wallet']],
  ['Has', ['Anything', 'Abandoned cart', 'Unused coupon', 'Points expiring', 'Open support ticket', 'Items in wishlist']],
  ['Tag', ['Any', 'VIP', 'Wholesale', 'Influencer', 'Staff', 'Fraud watch']],
  ['Birthday', ['Any', 'This week', 'This month']],
];

export default class AllCustomersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllCustomers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Customers" page="All customers" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="users" title="Customers"
                  about="Every person who signed up or bought from you. Pick a ready view, or filter on anything."
                  secondary={[{ label: 'Export', onClick: v.csv }]}
                  more={[{ label: 'Print', onClick: v.print }, { label: 'Members', href: '/members' }, { label: 'Abandoned carts', href: '/abandoned-carts' }]}
                  primary={{ label: 'Add customer', onClick: v.openAdd }} />

                <section className="ix-card" aria-label="Customers">
                  {v.hasSel ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected customers">
                      <input type="checkbox" checked={v.allSel} onChange={v.toggleAll} aria-label="Select all" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selCount} selected</span>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkSms}><__Icon name="message-circle" width="16" height="16" aria-hidden="true" />Send SMS</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkCoupon}><__Icon name="ticket-percent" width="16" height="16" aria-hidden="true" />Assign coupon</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkTag}><__Icon name="tag" width="16" height="16" aria-hidden="true" />Add tag</button>
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Edit customer', onClick: v.editSel }, { label: 'Export', onClick: v.csv }, { label: 'Clear selection', onClick: v.clearSel }]} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {v.find ? (<>
                        <SearchField value={v.q} onChange={v.typeQ} placeholder="Search by name or phone" onDone={v.closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={v.tabs} label="Customer views" />
                        <span className="ix-tools">
                          <span className="ac-views"><Menu label="More views" icon="list" cls="ix-btn ix-btn--sm" items={v.moreViews} /></span>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ac-colbtn" aria-label="Columns" title="Columns" aria-haspopup="dialog" onClick={v.openCols}><__Icon name="columns-3" width="16" height="16" aria-hidden="true" /></button>
                        </span>
                      </>)}
                    </div>
                  )}
                  {v.find && !v.hasSel ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="City or area" className={'ix-filter' + (v.pills.fCity ? ' is-set' : '')} value={v.pills.fCity} onChange={v.setCity}>
                        <option value="">Location</option>{v.cities.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select aria-label="Account status" className={'ix-filter' + (v.pills.fStatus ? ' is-set' : '')} value={v.pills.fStatus} onChange={v.setStatus}>
                        <option value="">Status</option><option>Active</option><option>Suspended</option><option>COD blocked</option>
                      </select>
                      <select aria-label="Member level" className={'ix-filter' + (v.pills.fLevel ? ' is-set' : '')} value={v.pills.fLevel} onChange={v.setLevel}>
                        <option value="">Level</option><option>Member</option><option>Silver</option><option>Gold</option><option>Platinum</option>
                      </select>
                      <select aria-label="Came from" className={'ix-filter' + (v.pills.fSrc ? ' is-set' : '')} value={v.pills.fSrc} onChange={v.setSrc}>
                        <option value="">Came from</option><option>Facebook ad</option><option>Instagram</option><option>Google</option><option>TikTok</option><option>Invite a friend</option><option>Shop counter (POS)</option>
                      </select>
                      <button type="button" className={'ix-filter' + (v.hasF ? ' is-set' : '')} onClick={v.openF} aria-haspopup="dialog" style={{ backgroundImage: 'none', paddingRight: 10 }}>More filters</button>
                      {v.hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clearAll}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="users" title={v.emptyTitle} actionLabel={v.emptyAction} onAction={v.emptyDo} /></div>
                  ) : v.isDupes ? (
                    <ul className="ac-pairs" aria-label="Possible duplicate customers">
                      {v.pairs.map((p) => (
                        <li key={p.id} className="ac-pair">
                          <div className="ac-pair__why"><__StatusBadge tone="warning" icon="users">{p.why}</__StatusBadge></div>
                          <div className="ac-pair__sides">
                            {[p.a, p.b].map((c, i) => (
                              <__Link key={i} href={c.href} className="ac-pair__side">
                                <span className="ac-pair__name">{c.name}</span>
                                <span className="ac-pair__sub ac-mono">{c.phone}</span>
                                <span className="ac-pair__sub">{c.orders} orders · {c.spent} spent · {c.types}</span>
                              </__Link>
                            ))}
                          </div>
                          <div className="ac-pair__acts">
                            <button type="button" className="ix-btn ix-btn--sm" onClick={p.notDupe}>Not the same</button>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={p.merge} aria-haspopup="dialog">Merge…</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (<>
                    <ul className="ix-plist" aria-label={v.caption}>
                      {v.rows.map((r) => (
                        <li key={r.key}>
                          <__Link href={r.href} className={'ix-pitem' + (r.isNew ? ' ac-pitem-new' : '')}>
                            <span className="ix-pitem__top"><b>{r.name}</b><span>{r.spent}</span></span>
                            <span className="ix-pitem__mid">{r.city} · {r.orders === 1 ? '1 order' : r.orders + ' orders'}</span>
                            {r.status !== 'Active' || r.due || r.wholesale ? (
                              <span className="ix-pitem__tags">
                                {r.status !== 'Active' ? <__StatusBadge tone={r.statusTone}>{r.status}</__StatusBadge> : null}
                                {r.due ? <__StatusBadge tone="error" icon="circle-alert">{r.due} due</__StatusBadge> : r.wholesale ? <__StatusBadge tone="primary" icon="store">Wholesale</__StatusBadge> : null}
                              </span>
                            ) : null}
                          </__Link>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">{v.caption}</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} /></th>
                            <th scope="col">Customer</th>
                            {v.heads.map((h) => <th key={h.k} scope="col" className={h.al === 'right' ? 'ix-num' : ''}>{h.l}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.key} className={(r.sel ? 'is-sel' : '') + (r.isNew ? ' is-new' : '')} onClick={r.onRowClick}>
                              <td className="ix-check"><input type="checkbox" aria-label={`Select ${r.name}`} checked={r.sel} onChange={r.toggle} /></td>
                              <td>
                                <span className="ac-cust" title={r.merged ? r.name + ' · ' + r.merged : undefined}>
                                  <__Link href={r.href} className="ix-strong">{r.name}</__Link>
                                  {r.wholesale ? <__StatusBadge tone="primary" icon="store">Wholesale</__StatusBadge> : null}
                                </span>
                              </td>
                              {r.cells.map((cl) => (
                                <td key={cl.k} className={cl.cls || ''}>{cl.badge ? <__StatusBadge tone={cl.badge}>{cl.v}</__StatusBadge> : cl.trunc ? <span className="ac-trunc" title={cl.v}>{cl.v}</span> : cl.v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <Pager label={v.countLabel} atStart atEnd prev={() => {}} next={() => {}} />
                </section>
                <LearnMore topic="customers" />
              </div>
          <__Dialog open={v.addOpen} title="Add customer" onClose={v.closeAdd} width={480} footer={<>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeAdd}>Cancel</button>
            <button type="submit" form="ac-add-form" className="gc-btn gc-btn--sm gc-btn--solid">Save customer</button>
          </>}>
            <form id="ac-add-form" className="ac-form" noValidate onSubmit={v.submitAdd}>
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
              <fieldset className="ac-field ac-mgset" aria-describedby={v.errTypes ? "ac-add-type-err" : "ac-add-type-help"}>
                <legend className="gc-label">Customer type <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></legend>
                <div className="ac-types">
                  {CUST_TYPES.map((t) => { const on = (v.form?.types || []).indexOf(t) >= 0; return (
                    <label key={t} className={"ac-type" + (on ? " is-on" : "")}>
                      <input id={"ac-add-type-" + t} type="checkbox" className="gc-check" checked={on} onChange={() => v.toggleType(t)} />{t}
                    </label>); })}
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" aria-pressed={(v.form?.types || []).length === 3} onClick={() => v.toggleType('all')}>All three</button>
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
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeMerge}>Cancel</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.confirmMerge}>Keep {v.mergeKeepName}</button>
          </>}>
            <fieldset className="ac-mgset">
              <legend className="gc-label">Which record do you keep?</legend>
              <div className="ac-mg">
                {v.mergeSides.map((c) => (
                  <label key={c.key} className={'ac-mg__opt' + (c.on ? ' is-on' : '')}>
                    <span className="ac-mg__head">
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
              <__Dialog open={v.colsOpen} title="Columns" onClose={v.closeCols} width={440} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={v.extraOn ? v.hideExtraCols : v.showAllCols}>{v.extraOn ? 'Reset' : 'Show all'}</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.closeCols}>Done</button>
              </>}>
                <div className="ac-colchips" role="group" aria-label="Show columns:">
                  {v.colChips.map((c) => (
                    <button key={c.label} type="button" className={'ix-filter' + (c.on ? ' is-set' : '')} aria-pressed={c.on} onClick={c.pick} style={{ backgroundImage: 'none', paddingRight: 10 }}>{c.on ? <__Icon name="check" width="14" height="14" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} /> : null}{c.label}</button>
                  ))}
                </div>
              </__Dialog>
              <__Dialog open={v.fOpen} title="More filters" onClose={v.closeF} width={560} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={v.clearF}>Clear</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.saveView}>Save as a view</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.applyF}>Show customers</button>
              </>}>
                <div className="ac-fgrid">
                  {FILTERS_MORE.map(([label, opts]) => (
                    <div key={label}>
                      <label className="gc-label" htmlFor={'ac-f-' + label}>{label}</label>
                      <select id={'ac-f-' + label} className="gc-input gc-select" aria-label={label}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
                    </div>
                  ))}
                </div>
              </__Dialog>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
