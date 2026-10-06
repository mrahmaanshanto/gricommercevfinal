'use client';
// Generated from design/templates/customers-crm/AllCustomers.dc.html by scripts/convert-design.mjs.
// AllCustomers — Customers, laid out like Shopify's Customers list (components/ui/IndexKit.jsx): title row, then one
// card with the views as tabs (the rest under More views), search and filter pills, bulk actions and a compact table
// (customer, status, location, orders, amount spent, due). Extra columns are picked in Columns; edits, merges and the
// customer book are kept in this browser.
// The one customer list (brief #7): persons and companies (lib/crm.js), each with a stable customer ID. Search finds
// any phone, email, customer ID or outside ID; filters keep status apart from restrictions and add type, consent and
// segment (lib/segments.js, with a builder). Bulk tag / segment / consent / export run as background jobs
// (lib/bulkJobs.js); a bulk message first shows how many can get it.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { addCustomer, PRICE_TIERS, updateCustomer, mergeCustomers, phoneDigits, customerMatches, addCompany, resolveCustomer, DEMO_LIST, CUSTOMER_STATUSES } from '@/lib/customers';
import { getCrmRows } from '@/lib/crm';
import { saveDemoEdit, addMerge, getNotDupes, addNotDupe, removeFromBook } from '@/lib/customerEdits';
import { getSegments, SEGMENT_TEMPLATES, segmentMembers, getSegment } from '@/lib/segments';
import { CONSENT_CHANNELS, CONSENT_STATES, CONSENT_SOURCES, getConsent } from '@/lib/consent';
import { RESTRICTION_TYPES } from '@/lib/restrictions';
import { startJob, consentSummary } from '@/lib/bulkJobs';
import { applyRetention } from '@/lib/crmPrivacy';
import { currentUser } from '@/lib/team';
import { wholesaleOn } from '@/lib/edition';
// wholesale customers, price lists and the Wholesale view show only while wholesale is on (edition.js; off for now)
var WS = wholesaleOn();
import CustomerEditDialog from './CustomerEditDialog';
import { SegmentBuilder, JobsCard, CRM_PARTS_CSS } from './crmParts';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Pager, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast as uiToast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { ModuleSetup } from '@/components/ModuleSetup';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var VIEWS = [
  { k: 'all', label: 'All customers', n: 2452 }, { k: 'wholesale', label: 'Wholesale customers', n: 0 }, { k: 'company', label: 'Companies', n: 0 }, { k: 'signToday', label: 'Signed up today', n: 14 }, { k: 'orderToday', label: 'Ordered today', n: 38 }, { k: 'week', label: 'New this week', n: 61 },
  { k: 'noOrder', label: 'Signed up, no order yet', n: 212 }, { k: 'repeat', label: 'Repeat buyers', n: 486 }, { k: 'big', label: 'Big spenders', n: 124 }, { k: 'cart', label: 'Left a cart', n: 31 },
  { k: 'pts', label: 'Points expiring', n: 64 }, { k: 'bday', label: 'Birthday this month', n: 97 }, { k: 'codBlock', label: 'COD blocked', n: 3 }, { k: 'restricted', label: 'Restrictions', n: 0 }, { k: 'suspended', label: 'Suspended', n: 6 },
  { k: 'cleanup', label: 'Needs cleanup', n: 0 }, { k: 'dupes', label: 'Possible duplicates', n: 0 }
];
VIEWS = VIEWS.filter(function (v) { return v.k !== 'wholesale' || WS; });
// Columns of the list, in order. The main ones always show (Shopify's Customers list: customer, status, location,
// orders, amount spent, and what they still owe); the extra ones are picked in Columns.
var COLS = [
  { k: 'status', l: 'Status' }, { k: 'city', l: 'Location' }, { k: 'id', l: 'Customer ID', extra: true }, { k: 'kind', l: 'Type', extra: true }, { k: 'email', l: 'Email', extra: true }, { k: 'signup', l: 'Signed up', extra: true },
  { k: 'last', l: 'Last order', extra: true }, { k: 'level', l: 'Level', extra: true }, { k: 'pts', l: 'Points', al: 'right', extra: true }, { k: 'src', l: 'Came from', extra: true },
  { k: 'restr', l: 'Restrictions', extra: true }, { k: 'tags', l: 'Tags', extra: true },
  { k: 'orders', l: 'Orders', al: 'right' }, { k: 'spent', l: 'Amount spent', al: 'right' }, { k: 'due', l: 'Due', al: 'right' }
];
var STONE = { 'Active': 'success', 'Suspended': 'error', 'Closed': 'neutral' };
var LTONE = { Member: 'neutral', Silver: 'neutral', Gold: 'warning', Platinum: 'primary' };
// Views shown as tabs, in priority order; the rest are in "More views" (the one picked from there shows as a tab).
var PRIMARY = ['all', 'wholesale', 'company', 'signToday', 'orderToday', 'week', 'repeat', 'big'].filter(function (k) { return k !== 'wholesale' || WS; });
var CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Outside Dhaka'];
var NO_PILLS = { fCity: '', fStatus: '', fLevel: '', fSrc: '', fRestr: '', fKind: '', fConsent: '', fSeg: '' };
var PILL_KEYS = Object.keys(NO_PILLS);
var TODAY = '19 Sep 2026'; // "today" in the demo data
var EMPTY_FORM = { kind: 'person', name: '', phone: '', area: '', types: ['Online'], tier: 'A', credit: '', email: '', bin: '', terms: 'Net 30' };
var CUST_TYPES = ['Online', 'Retail', 'Wholesale'].filter(function (t) { return t !== 'Wholesale' || WS; });   // how the customer buys; one, two or all three
var TAG_CHOICES = ['VIP', 'Wholesale', 'Influencer', 'Staff', 'Follow up', 'Eid buyer'].filter(function (t) { return t !== 'Wholesale' || WS; });
function compact(x) { return String(x || '').replace(/[\s\-().]/g, '').toLowerCase(); }
/** Bangladeshi mobile as 11 digits (01XXXXXXXXX), or '' when it is not one. Accepts +88 / 88 prefixes. */
function bdMobile(x) { var d = compact(x); if (d.indexOf('+88') === 0) d = d.slice(3); else if (d.indexOf('88') === 0 && d.length === 13) d = d.slice(2); return /^01[3-9]\d{8}$/.test(d) ? d : ''; }
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
  var out = [], live = rows.filter(function (r) { return r.name.indexOf('Guest') !== 0 && r.kind !== 'company'; });
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
function typesText(types) { return (types || []).length ? types.join(', ') : '—'; }
/** Wholesale buyers open the wholesale profile; everyone else (and companies) the customer profile. */
function hrefOf(c) { return WS && c.wholesale && c.kind !== 'company' && c.origin !== 'party' ? '/wholesale-customer?phone=' + (c.bookPhone || phoneDigits(c.phone)) + (c.book ? '' : '&demo=' + c.demoId) : '/customer-crm?id=' + encodeURIComponent(c.id); }
/** One side of a duplicate pair, as shown in the list and the merge dialog. */
function sideOf(c) {
  return { name: c.name, phone: c.phone, initial: c.name.charAt(0).toUpperCase(), href: hrefOf(c), orders: c.orders.toLocaleString('en-IN'), spent: c.spent ? bdt(c.spent) : '—', due: c.due ? bdt(c.due) : '—', hasDue: !!c.due,
    types: typesText(c.types), src: c.src, signup: c.signup, last: c.last, id: c.id };
}
/** Status shown in the list: the account status, or the first restriction of an active account. */
function statusCell(c) {
  if (c.status === 'Active' && (c.restrictionShort || []).length) return { v: c.restrictionShort[0], tone: 'warning' };
  return { v: c.status, tone: STONE[c.status] || 'neutral' };
}

class Component extends DCLogic {
  componentDidMount() {
    try {
      var qs = new URLSearchParams(window.location.search), k = qs.get('view'), seg = qs.get('segment');
      if (k && VIEWS.some(function (x) { return x.k === k; })) this.setState({ view: k });
      if (seg && getSegment(seg)) this.setState({ pills: assign(assign({}, NO_PILLS), { fSeg: seg }), find: true });
    } catch (e) { /* no URL access */ }
    applyRetention();
    this.load();
  }
  /** Rows from lib/crm.js: the customer book (orders, spend and due from their invoices), the demo list and the
   *  companies, with the edits and merges made in this browser. */
  load = (justAdded) => {
    var rows = getCrmRows({ justAdded: justAdded }), notDupes = getNotDupes();
    var here = {}; rows.forEach(function (r) { here[r.key] = true; });
    // demo rows merged away still count against the demo totals of their views
    var gone = DEMO_LIST.filter(function (d) { return !here['d:' + d.id]; });
    this.setState({ rows: rows, gone: gone, pairs: findPairs(rows, notDupes), segs: getSegments() });
  };
  reload = () => { this.load(); };

  // ---- edit a customer ----
  openEdit = (r) => {
    this.setState({ editRow: r, editCust: { name: r.name, phone: r.phone, address: r.address || '', types: r.types, tier: r.tier || 'A', creditLimit: r.creditLimit || 0 } });
  };
  closeEdit = () => { this.setState({ editRow: null }); };
  editPhoneTaken = (d) => {
    var s = this.state || {}, me = s.editRow;
    return (s.rows || []).some(function (r) { return (!me || r.key !== me.key) && phoneDigits(r.phone) === d; });
  };
  saveEdit = (vals) => {
    var r = (this.state || {}).editRow; if (!r) return;
    var wasWhole = r.wholesale, isWhole = vals.types.indexOf('Wholesale') >= 0;
    if (r.book) updateCustomer(r.bookPhone, { name: vals.name, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit });
    else if (r.origin === 'demo') saveDemoEdit(r.demoId, { name: vals.name, phone: vals.phone, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit, due: r.due });
    else uiToast('Open the company to change it.', { tone: 'info' });
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
    if (drop.kind === 'company' || keep.kind === 'company') { uiToast('Companies are not merged here. Move the contacts on the company instead.', { tone: 'info' }); return; }
    if (drop.companyId && keep.companyId && drop.companyId !== keep.companyId) { uiToast('These two work for different companies. Unlink one first.', { tone: 'error' }); return; }
    if (drop.book) mergeCustomers(keep.bookPhone || phoneDigits(keep.phone), drop.bookPhone);
    addMerge({ keep: keep.key, drop: drop.key, dropName: drop.name, dropPhone: drop.phone, dropId: drop.id, keepId: keep.id });
    this.setState({ mergePair: null, sel: {} });
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
  pickSegment = (id) => {
    var s = this.state || {};
    this.setState({ pills: assign(assign({}, NO_PILLS, s.pills || {}), { fSeg: id }), find: true, sel: {} });
    if ((s.view || 'all') === 'dupes') this.setView('all');
  };

  // ---- add customer (person or company) ----
  openAdd = (kind) => { this.setState({ addOpen: true, form: assign(assign({}, EMPTY_FORM), { kind: kind === 'company' ? 'company' : 'person' }), errs: {}, dupe: null }); };
  closeAdd = () => { this.setState({ addOpen: false }); };
  typeField = (e) => {
    var s = this.state || {}, f = assign({}, s.form || EMPTY_FORM), er = assign({}, s.errs || {});
    f[e.target.name] = e.target.value; delete er[e.target.name];
    this.setState({ form: f, errs: er, dupe: e.target.name === 'phone' ? null : s.dupe });
  };
  setKind = (k) => { var s = this.state || {}; this.setState({ form: assign(assign({}, s.form || EMPTY_FORM), { kind: k, types: k === 'company' ? [WS ? 'Wholesale' : 'Retail'] : ['Online'] }), errs: {}, dupe: null }); };
  toggleType = (type) => {
    var s = this.state || {}, f = assign({}, s.form || EMPTY_FORM), er = assign({}, s.errs || {});
    var cur = f.types || [];
    f.types = type === 'all' ? (cur.length === CUST_TYPES.length ? [] : CUST_TYPES.slice()) : CUST_TYPES.filter(function (x) { return x === type ? cur.indexOf(x) < 0 : cur.indexOf(x) >= 0; });
    delete er.types;
    this.setState({ form: f, errs: er });
  };
  submitAdd = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    var s = this.state || {}, f = s.form || EMPTY_FORM, er = {}, self = this;
    var name = f.name.trim().replace(/\s+/g, ' '), area = f.area.trim(), d = bdMobile(f.phone), company = f.kind === 'company';
    if (!name) er.name = company ? 'Enter the company name.' : 'Enter the customer’s name.';
    else if (name.length < 2) er.name = 'The name needs at least 2 characters.';
    var dupe = null;
    if (!company || f.phone.trim()) {
      if (!f.phone.trim()) er.phone = 'Enter a mobile number.';
      else if (!d) er.phone = 'Enter an 11-digit Bangladeshi mobile number, like 01712345678.';
      else { dupe = resolveCustomer(d); if (dupe) er.phone = 'A customer with this mobile number already exists.'; }
    }
    if (f.email && f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Enter an email like name@example.com.';
    else if (f.email && f.email.trim() && !dupe) { dupe = resolveCustomer(f.email.trim()); if (dupe) er.email = 'A customer with this email already exists.'; }
    var types = f.types || [], whole = types.indexOf('Wholesale') >= 0;
    if (!types.length) er.types = WS ? 'Choose at least one: Online, Retail or Wholesale.' : 'Choose at least one: Online or Retail.';
    var credit = String(f.credit || '').trim() === '' ? 0 : Number(f.credit);
    if (whole && (!isFinite(credit) || credit < 0)) er.credit = 'Enter 0 or more. 0 means no limit.';
    var first = er.name ? 'name' : er.phone ? 'phone' : er.email ? 'email' : er.types ? 'type-Online' : er.credit ? 'credit' : '';
    if (first) { this.setState({ errs: er, dupe: dupe }, function () { var el = document.getElementById('ac-add-' + first); if (el) el.focus(); }); return; }
    if (company) {
      var co = addCompany({ name: name, phone: d, email: (f.email || '').trim(), address: area, bin: (f.bin || '').trim(), tier: f.tier || 'A', creditLimit: Math.round(credit), terms: f.terms, types: types, owner: (currentUser() || {}).name || '' });
      this.setState({ addOpen: false, q: '', sel: {} });
      this.load();
      uiToast(name + ' was added as a company. Add its locations and contact people here.');
      navigate('/customer-crm?id=' + encodeURIComponent(co.id) + '&tab=details');
      return;
    }
    // kept in the customer book, so New sale finds the customer and loads the wholesale prices
    addCustomer({ name: name, phone: d, address: area, types: types, tier: whole ? (f.tier || 'A') : undefined, creditLimit: whole ? Math.round(credit) : 0, signup: TODAY,
      src: types.join(' · ') + (whole ? ' (' + PRICE_TIERS[f.tier || 'A'].label.split(' · ')[0] + ')' : '') + ' · added by staff' });
    var view = s.view || 'all', keep = view === 'all' || (whole && view === 'wholesale') || ['signToday', 'week', 'noOrder'].indexOf(view) >= 0;
    this.setState({ addOpen: false, q: '', sel: {} });
    this.load(d);
    if (!keep) this.setView('all');
    uiToast(name + ' was added to your customers.', { undo: function () { removeFromBook(d); self.load(); } });
  };

  // ---- bulk ----
  bulk = (kind, ids, params) => {
    var me = (currentUser() || {}).name || 'Staff';
    var j = startJob(kind, ids, params, me);
    this.setState({ dlg: null, sel: {} });
    uiToast(j.label + ': started for ' + ids.length + (ids.length === 1 ? ' customer.' : ' customers.') + ' It runs in the background.');
  };

  renderVals() {
    var self = this, s = this.state || {};
    var view = s.view || 'all', pick = s.pick || {}, sel = s.sel || {};
    var q = s.q || '', qShown = q.trim(), form = s.form || EMPTY_FORM, errs = s.errs || {};
    var pills = assign(assign({}, NO_PILLS), s.pills || {});
    var pillCount = PILL_KEYS.filter(function (k) { return !!pills[k]; }).length;
    var ALL = s.rows || [];
    var pairs = s.pairs || [];
    var isDupes = view === 'dupes';
    var cols = COLS.filter(function (c) { return !c.extra || pick[c.k]; });
    var inView = isDupes ? [] : ALL.filter(function (c) { return view === 'all' || c.f.indexOf(view) >= 0; });
    var segIds = null;
    if (pills.fSeg) { segIds = {}; segmentMembers(pills.fSeg, ALL).forEach(function (c) { segIds[c.id] = true; }); }
    var pillOk = function (c) {
      var cons = pills.fConsent ? pills.fConsent.split(':') : null;
      return (!pills.fCity || (pills.fCity === 'Dhaka' ? /Dhaka/.test(c.city) && c.city !== 'Outside Dhaka' : c.city.indexOf(pills.fCity) >= 0))
        && (!pills.fStatus || c.status === pills.fStatus) && (!pills.fLevel || c.level === pills.fLevel) && (!pills.fSrc || String(c.src).indexOf(pills.fSrc) >= 0)
        && (!pills.fRestr || (pills.fRestr === 'any' ? c.restrictions.length > 0 : pills.fRestr === 'none' ? !c.restrictions.length : c.restrictions.some(function (r) { return r.type === pills.fRestr; })))
        && (!pills.fKind || c.kind === pills.fKind)
        && (!cons || getConsent(c)[cons[0]].state === cons[1])
        && (!segIds || !!segIds[c.id]);
    };
    var list = inView.filter(function (c) { return customerMatches(c, q, ALL) && pillOk(c); });
    var pairList = pairs.filter(function (p) { return customerMatches(p.a, q, ALL) || customerMatches(p.b, q, ALL); });
    var V = VIEWS.filter(function (v) { return v.k === view; })[0];
    // Demo totals per view, adjusted for the customer book, companies, edits (e.g. made wholesale) and merges.
    var countOf = function (v) {
      if (v.k === 'dupes') return pairs.length;
      var n = v.n;
      ALL.forEach(function (r) {
        var now = v.k === 'all' || r.f.indexOf(v.k) >= 0;
        if (r.origin !== 'demo') { if (now) n++; } else { var base = v.k === 'all' || (r.baseF || []).indexOf(v.k) >= 0; n += (now ? 1 : 0) - (base ? 1 : 0); }
      });
      (s.gone || []).forEach(function (d) { if (v.k === 'all' || d.f.indexOf(v.k) >= 0) n--; });
      return Math.max(0, n);
    };
    var total = countOf(V);
    var selRows = list.filter(function (c) { return sel[c.key]; });
    var selN = selRows.length;
    var selIds = selRows.map(function (c) { return c.id; });
    var filtered = !!qShown || pillCount > 0;
    var outN = filtered ? (isDupes ? pairList.length : list.length) : total;
    var cell = function (c, k) {
      var v = c[k];
      if (k === 'spent') return { v: v ? bdt(v) : '—', cls: 'ix-num' };
      if (k === 'due') return { v: v ? bdt(v) : '—', cls: 'ix-num' + (v ? ' ix-bad' : ' ix-muted') };
      if (k === 'orders' || k === 'pts') return { v: typeof v === 'number' ? v.toLocaleString('en-IN') : v, cls: 'ix-num' };
      if (k === 'status') { var st = statusCell(c); return { badge: st.tone, v: st.v }; }
      if (k === 'level') return { badge: LTONE[v] || 'neutral', v: v };
      if (k === 'id') return { v: v, cls: 'ix-muted ly-fig' };
      if (k === 'kind') return { v: v === 'company' ? 'Company' : 'Person', cls: 'ix-muted' };
      if (k === 'restr') return { v: (c.restrictionShort || []).join(', ') || '—', cls: 'ix-muted', trunc: true };
      if (k === 'tags') return { v: (c.tags || []).join(', ') || '—', cls: 'ix-muted', trunc: true };
      if (k === 'email' || k === 'city' || k === 'src') return { v: v || '—', cls: 'ix-muted', trunc: true };
      if (k === 'signup' || k === 'last') return { v: v, cls: 'ix-muted' };
      return { v: v, cls: '' };
    };
    // tabs: the main views, the view picked from More views, and Possible duplicates while there are any
    var tabKeys = PRIMARY.concat(PRIMARY.indexOf(view) < 0 && view !== 'dupes' ? [view] : []).concat(pairs.length || isDupes ? ['dupes'] : []);
    var tabs = tabKeys.map(function (k) { var v = VIEWS.filter(function (x) { return x.k === k; })[0]; return { key: k, id: 'ac-tab-' + k, label: v.label, count: countOf(v).toLocaleString('en-IN'), on: k === view, onClick: function () { self.setView(k); } }; });
    var moreViews = VIEWS.filter(function (v) { return tabKeys.indexOf(v.k) < 0; }).map(function (v) { return { label: v.label + ' · ' + countOf(v).toLocaleString('en-IN'), onClick: function () { self.setView(v.k); } }; });
    var setPill = function (k) { return function (e) { var o = assign({}, pills); o[k] = e.target.value; self.setState({ pills: o, sel: {} }); }; };
    var clearAll = function () { self.setState({ q: '', pills: NO_PILLS, fApplied: false, sel: {} }); };
    var segs = s.segs || [];
    var segChoices = segs.map(function (x) { return [x.id, x.name]; }).concat(SEGMENT_TEMPLATES.map(function (t) { return [t.id, t.name + ' · ready-made']; }));
    var segMenu = segs.map(function (x) { return { label: x.name, onClick: function () { self.pickSegment(x.id); } }; })
      .concat(SEGMENT_TEMPLATES.map(function (t) { return { label: t.name + ' · ready-made', onClick: function () { self.pickSegment(t.id); } }; }))
      .concat([{ label: 'New segment…', onClick: function () { self.setState({ segOpen: true, segEdit: null }); } }, { label: 'Manage segments', href: '/customer-settings#segments' }]);
    var curSeg = pills.fSeg ? getSegment(pills.fSeg) : null;
    var dlg = s.dlg || null;
    var cs = dlg === 'msg' ? consentSummary(selIds) : null;
    var msgCh = s.msgCh || 'sms';
    var me = (currentUser() || {}).name || 'Staff';
    return {
      tabs: tabs, moreViews: moreViews, segMenu: segMenu,
      q: q, typeQ: self.typeQ, hasQ: !!qShown,
      find: !!(s.find || qShown || pillCount), openFind: function () { self.setState({ find: true }); },
      closeFind: function () { self.setState({ find: false, q: '', pills: NO_PILLS, fApplied: false, sel: {} }); },
      pills: pills, setCity: setPill('fCity'), setStatus: setPill('fStatus'), setLevel: setPill('fLevel'), setSrc: setPill('fSrc'), setRestr: setPill('fRestr'), setKind: setPill('fKind'), setConsent: setPill('fConsent'), setSeg: setPill('fSeg'), cities: CITIES,
      segChoices: segChoices, curSeg: curSeg && !curSeg.owner ? curSeg : null, editSeg: function () { self.setState({ segOpen: true, segEdit: curSeg }); },
      segOpen: !!s.segOpen, segEdit: s.segEdit || null, closeSeg: function () { self.setState({ segOpen: false }); },
      savedSeg: function (seg) { self.setState({ segOpen: false, segs: getSegments() }); self.pickSegment(seg.id); uiToast('Segment “' + seg.name + '” saved.'); },
      allRows: ALL, me: me,
      hasFilters: filtered || !!s.fApplied, clearAll: clearAll,
      emptyTitle: qShown ? 'No customers match “' + qShown + '”' : isDupes ? 'No possible duplicates' : 'No customers in this view',
      emptyAction: filtered ? 'Clear search' : 'Show all customers', emptyDo: filtered ? clearAll : self.showAll,
      addOpen: !!s.addOpen, openAdd: function () { self.openAdd('person'); }, openAddCompany: function () { self.openAdd('company'); }, closeAdd: self.closeAdd, submitAdd: self.submitAdd, typeField: self.typeField, form: form, toggleType: self.toggleType, errTypes: (s.errs || {}).types,
      isCompanyForm: form.kind === 'company', setFormKind: self.setKind,
      errName: errs.name || '', errPhone: errs.phone || '', errEmail: errs.email || '', errCredit: errs.credit || '',
      dupe: s.dupe ? { name: s.dupe.name, href: '/customer-crm?id=' + encodeURIComponent(s.dupe.id) } : null,
      // Columns: the extra facts a merchant may want in the list
      colsOpen: !!s.colsOpen, openCols: function () { self.setState({ colsOpen: true }); }, closeCols: function () { self.setState({ colsOpen: false }); },
      extraOn: COLS.some(function (c) { return c.extra && pick[c.k]; }),
      colChips: COLS.filter(function (c) { return c.extra; }).map(function (c) { var on = !!pick[c.k]; return { label: c.l, on: on, pick: function () { var p = assign({}, pick); p[c.k] = !on; self.setState({ pick: p }); } }; }),
      showAllCols: function () { var p = {}; COLS.forEach(function (c) { if (c.extra) p[c.k] = true; }); self.setState({ pick: p }); },
      hideExtraCols: function () { self.setState({ pick: {} }); },
      // More filters (dialog)
      fOpen: !!s.fOpen, openF: function () { self.setState({ fOpen: true }); }, closeF: function () { self.setState({ fOpen: false }); }, hasF: !!s.fApplied,
      clearF: function () { self.setState({ fApplied: false, fOpen: false }); }, applyF: function () { self.setState({ fApplied: true, fOpen: false }); uiToast('Filters applied.'); },
      saveView: function () { self.setState({ fOpen: false, segOpen: true, segEdit: null }); },
      print: function () { uiToast('Opening a print-ready list of ' + outN.toLocaleString('en-IN') + ' customers with the columns you see.'); },
      csv: function () { var ids = (selN ? selRows : list).map(function (c) { return c.id; }); if (!ids.length) { uiToast('No customers to export.', { tone: 'info' }); return; } self.bulk('export', ids, {}); },
      heads: cols.map(function (c) { return { k: c.k, l: c.l, al: c.al || 'left' }; }),
      rows: list.map(function (c) { var on = !!sel[c.key], href = hrefOf(c), st = statusCell(c); return { key: c.key, href: href, wholesale: WS && !!c.wholesale && c.kind !== 'company', company: c.kind === 'company', name: c.name, city: c.city, orders: c.orders, spent: c.spent ? bdt(c.spent) : '—', due: c.due ? bdt(c.due) : '', status: st.v, statusTone: st.tone, sel: on, isNew: !!c.isNew, merged: c.mergedFrom ? 'Merged with ' + c.mergedFrom.join(', ') : '',
        sub: c.kind === 'company' ? (c.locationsCount || 0) + (c.locationsCount === 1 ? ' location · ' : ' locations · ') + (c.contactsCount || 0) + (c.contactsCount === 1 ? ' contact' : ' contacts') : c.companyName ? c.role + ' · ' + c.companyName : '',
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
      bulkSms: function () { self.setState({ dlg: 'msg', msgCh: 'sms' }); },
      bulkCoupon: function () { uiToast('A one-time coupon was assigned to ' + selN + ' customers.'); },
      bulkTag: function () { self.setState({ dlg: 'tag', tagMode: 'tag', tagVal: '' }); },
      bulkUntag: function () { self.setState({ dlg: 'tag', tagMode: 'untag', tagVal: '' }); },
      bulkSeg: function () { self.setState({ dlg: 'seg', segPick: (segs[0] || {}).id || '' }); },
      bulkConsent: function () { self.setState({ dlg: 'consent', cCh: 'sms', cSt: 'out', cSrc: 'Staff' }); },
      canMerge2: selN === 2, mergeSel: function () { self.openMerge({ id: [selRows[0].key, selRows[1].key].sort().join('|'), a: selRows[0], b: selRows[1], why: 'Chosen by you' }); },
      // bulk dialogs
      dlg: dlg, closeDlg: function () { self.setState({ dlg: null }); },
      msgChans: CONSENT_CHANNELS.filter(function (c) { return c.k !== 'call'; }).map(function (c) { return { k: c.k, label: c.label, n: cs ? cs[c.k] : 0, on: c.k === msgCh, pick: function () { self.setState({ msgCh: c.k }); } }; }),
      msgTotal: cs ? cs.total : 0, msgOk: cs ? cs[msgCh] : 0, msgChLabel: (CONSENT_CHANNELS.filter(function (c) { return c.k === msgCh; })[0] || {}).label,
      sendMsg: function () { var n = cs ? cs[msgCh] : 0; self.setState({ dlg: null, sel: {} }); uiToast(n ? n + ' customers handed to Communications for ' + (CONSENT_CHANNELS.filter(function (c) { return c.k === msgCh; })[0] || {}).label + '. ' + (cs.total - n) + ' left out: no consent.' : 'No one selected can get this message.', n ? undefined : { tone: 'info' }); },
      tagMode: s.tagMode || 'tag', tagVal: s.tagVal || '', typeTag: function (e) { self.setState({ tagVal: e.target.value }); },
      tagChips: TAG_CHOICES.map(function (t) { return { t: t, on: t === s.tagVal, pick: function () { self.setState({ tagVal: t }); } }; }),
      runTag: function () { var t = String(s.tagVal || '').trim(); if (!t) { uiToast('Choose or type a tag.', { tone: 'info' }); return; } self.bulk(s.tagMode === 'untag' ? 'untag' : 'tag', selIds, { tag: t }); },
      segs: segs, segPick: s.segPick || '', setSegPick: function (e) { self.setState({ segPick: e.target.value }); },
      runSeg: function () { if (!s.segPick) { uiToast('Save a segment first.', { tone: 'info' }); return; } self.bulk('segment', selIds, { segmentId: s.segPick }); },
      cCh: s.cCh || 'sms', cSt: s.cSt || 'out', cSrc: s.cSrc || 'Staff',
      setCCh: function (e) { self.setState({ cCh: e.target.value }); }, setCSt: function (e) { self.setState({ cSt: e.target.value }); }, setCSrc: function (e) { self.setState({ cSrc: e.target.value }); },
      runConsent: function () { self.bulk('consent', selIds, { channel: s.cCh || 'sms', state: s.cSt || 'out', source: s.cSrc || 'Staff' }); },
      reload: self.reload,
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
.ac-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
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
  ['Tag', ['Any', 'VIP', 'Wholesale', 'Influencer', 'Staff', 'Follow up'].filter(function (t) { return t !== 'Wholesale' || WS; })],
  ['Birthday', ['Any', 'This week', 'This month']],
];
const ERR = (id, text) => (<p id={id} className="gc-help gc-help--error ac-err"><__Icon name="circle-alert" width="14" height="14" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }} /><span>{text}</span></p>);

export default class AllCustomersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllCustomers">
        <style dangerouslySetInnerHTML={{ __html: CSS + CRM_PARTS_CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="customers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Customers" page="All customers" placeholder="Search customer by name or phone" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="users" title="Customers"
                  about="Every person and company who signed up or bought from you. Pick a ready view or a segment, or filter on anything. Search finds any phone, email, customer ID or outside ID."
                  secondary={[{ label: 'Export', onClick: v.csv }]}
                  more={[{ label: 'Add company', onClick: v.openAddCompany }, { label: 'New segment', onClick: () => this.setState({ segOpen: true, segEdit: null }) }, { label: 'Print', onClick: v.print }, { label: 'Customer settings', href: '/customer-settings' }, { label: 'Members', href: '/members' }, { label: 'Abandoned carts', href: '/abandoned-carts' }]}
                  primary={{ label: 'Add customer', onClick: v.openAdd }} />
                <ModuleSetup area="area-customers" />

                <JobsCard onChanged={v.reload} />

                <section className="ix-card" aria-label="Customers">
                  {v.hasSel ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected customers">
                      <input type="checkbox" checked={v.allSel} onChange={v.toggleAll} aria-label="Select all" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selCount} selected</span>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkSms} aria-haspopup="dialog"><__Icon name="message-circle" width="16" height="16" aria-hidden="true" />Send SMS</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkCoupon}><__Icon name="ticket-percent" width="16" height="16" aria-hidden="true" />Assign coupon</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkTag} aria-haspopup="dialog"><__Icon name="tag" width="16" height="16" aria-hidden="true" />Add tag</button>
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[
                        { label: 'Add to segment', onClick: v.bulkSeg }, { label: 'Change consent', onClick: v.bulkConsent }, { label: 'Remove tag', onClick: v.bulkUntag },
                        v.canMerge2 ? { label: 'Merge these 2', onClick: v.mergeSel } : null,
                        { label: 'Edit customer', onClick: v.editSel }, { label: 'Export', onClick: v.csv }, { label: 'Clear selection', onClick: v.clearSel }].filter(Boolean)} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {v.find ? (<>
                        <SearchField value={v.q} onChange={v.typeQ} placeholder="Search by name, phone, email or ID" onDone={v.closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={v.tabs} label="Customer views" />
                        <span className="ix-tools">
                          <span className="ac-views"><Menu label="More views" icon="list" cls="ix-btn ix-btn--sm" items={v.moreViews} /></span>
                          <span className="ac-views"><Menu label="Segments" icon="layers" cls="ix-btn ix-btn--sm" items={v.segMenu} /></span>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ac-colbtn" aria-label="Columns" title="Columns" aria-haspopup="dialog" onClick={v.openCols}><__Icon name="columns-3" width="16" height="16" aria-hidden="true" /></button>
                        </span>
                      </>)}
                    </div>
                  )}
                  {v.find && !v.hasSel ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Segment" className={'ix-filter' + (v.pills.fSeg ? ' is-set' : '')} value={v.pills.fSeg} onChange={v.setSeg}>
                        <option value="">Segment</option>{v.segChoices.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                      <select aria-label="City or area" className={'ix-filter' + (v.pills.fCity ? ' is-set' : '')} value={v.pills.fCity} onChange={v.setCity}>
                        <option value="">Location</option>{v.cities.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select aria-label="Account status" className={'ix-filter' + (v.pills.fStatus ? ' is-set' : '')} value={v.pills.fStatus} onChange={v.setStatus}>
                        <option value="">Status</option>{CUSTOMER_STATUSES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                      <select aria-label="Restriction" className={'ix-filter' + (v.pills.fRestr ? ' is-set' : '')} value={v.pills.fRestr} onChange={v.setRestr}>
                        <option value="">Restriction</option><option value="any">Any restriction</option><option value="none">No restriction</option>
                        {Object.keys(RESTRICTION_TYPES).map((k) => <option key={k} value={k}>{RESTRICTION_TYPES[k].short}</option>)}
                      </select>
                      <select aria-label="Customer type" className={'ix-filter' + (v.pills.fKind ? ' is-set' : '')} value={v.pills.fKind} onChange={v.setKind}>
                        <option value="">Type</option><option value="person">Person</option><option value="company">Company</option>
                      </select>
                      <select aria-label="Consent" className={'ix-filter' + (v.pills.fConsent ? ' is-set' : '')} value={v.pills.fConsent} onChange={v.setConsent}>
                        <option value="">Consent</option>
                        {CONSENT_CHANNELS.map((c) => Object.keys(CONSENT_STATES).map((st) => <option key={c.k + st} value={c.k + ':' + st}>{c.label}: {CONSENT_STATES[st]}</option>))}
                      </select>
                      <select aria-label="Member level" className={'ix-filter' + (v.pills.fLevel ? ' is-set' : '')} value={v.pills.fLevel} onChange={v.setLevel}>
                        <option value="">Level</option><option>Member</option><option>Silver</option><option>Gold</option><option>Platinum</option>
                      </select>
                      <select aria-label="Came from" className={'ix-filter' + (v.pills.fSrc ? ' is-set' : '')} value={v.pills.fSrc} onChange={v.setSrc}>
                        <option value="">Came from</option><option>Facebook ad</option><option>Instagram</option><option>Google</option><option>TikTok</option><option>Invite a friend</option><option>Shop counter (POS)</option><option>Sales team</option>
                      </select>
                      <button type="button" className={'ix-filter' + (v.hasF ? ' is-set' : '')} onClick={v.openF} aria-haspopup="dialog" style={{ backgroundImage: 'none', paddingRight: 10 }}>More filters</button>
                      {v.curSeg ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.editSeg} aria-haspopup="dialog">Edit segment</button> : null}
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
                                <span className="ac-pair__sub ac-mono">{c.phone} · {c.id}</span>
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
                            <span className="ix-pitem__mid">{r.sub ? r.sub + ' · ' : ''}{r.city} · {r.orders === 1 ? '1 order' : r.orders + ' orders'}</span>
                            {r.status !== 'Active' || r.due || r.wholesale || r.company ? (
                              <span className="ix-pitem__tags">
                                {r.status !== 'Active' ? <__StatusBadge tone={r.statusTone}>{r.status}</__StatusBadge> : null}
                                {r.due ? <__StatusBadge tone="error" icon="circle-alert">{r.due} due</__StatusBadge> : r.company ? <__StatusBadge tone="info" icon="building-2">Company</__StatusBadge> : r.wholesale ? <__StatusBadge tone="primary" icon="store">Wholesale</__StatusBadge> : null}
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
                                  {r.company ? <__StatusBadge tone="info" icon="building-2">Company</__StatusBadge> : r.wholesale ? <__StatusBadge tone="primary" icon="store">Wholesale</__StatusBadge> : null}
                                </span>
                                {r.sub ? <span className="ac-sub">{r.sub}</span> : null}
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
          <__Dialog open={v.addOpen} title={v.isCompanyForm ? 'Add company' : 'Add customer'} onClose={v.closeAdd} width={480} footer={<>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeAdd}>Cancel</button>
            <button type="submit" form="ac-add-form" className="gc-btn gc-btn--sm gc-btn--solid">{v.isCompanyForm ? 'Save company' : 'Save customer'}</button>
          </>}>
            <form id="ac-add-form" className="ac-form" noValidate onSubmit={v.submitAdd}>
              <div className="ix-chips" role="group" aria-label="Customer type">
                <button type="button" className="ix-chip" aria-pressed={!v.isCompanyForm} onClick={() => v.setFormKind('person')}><__Icon name="user" width="14" height="14" aria-hidden="true" />Person</button>
                <button type="button" className="ix-chip" aria-pressed={v.isCompanyForm} onClick={() => v.setFormKind('company')}><__Icon name="building-2" width="14" height="14" aria-hidden="true" />Company</button>
              </div>
              <div className="ac-field">
                <label className="gc-label" htmlFor="ac-add-name">{v.isCompanyForm ? 'Company name' : 'Full name'} <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                <input id="ac-add-name" name="name" data-autofocus="" className={v.errName ? "gc-input gc-input--error" : "gc-input"} value={v.form?.name} onChange={v.typeField} required aria-required="true" aria-invalid={v.errName ? "true" : "false"} aria-describedby={v.errName ? "ac-add-name-err" : undefined} autoComplete="off" maxLength={80} />
                {v.errName ? ERR('ac-add-name-err', v.errName) : null}
              </div>
              <div className="ac-field">
                <label className="gc-label" htmlFor="ac-add-phone">Mobile number {v.isCompanyForm ? <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" }}>(optional)</span> : <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span>}</label>
                <input id="ac-add-phone" name="phone" type="tel" inputMode="tel" className={v.errPhone ? "gc-input gc-input--error mono" : "gc-input mono"} value={v.form?.phone} onChange={v.typeField} placeholder="01XXXXXXXXX" required={!v.isCompanyForm} aria-required={v.isCompanyForm ? 'false' : 'true'} aria-invalid={v.errPhone ? "true" : "false"} aria-describedby={v.errPhone ? "ac-add-phone-err" : "ac-add-phone-help"} autoComplete="off" maxLength={20} />
                {v.errPhone ? ERR('ac-add-phone-err', v.errPhone) : (<p id="ac-add-phone-help" className="gc-help">11 digits, starting with 01.</p>)}
                {v.dupe ? <p className="gc-help" style={{ margin: 0 }}><__Link href={v.dupe.href}>Open {v.dupe.name}</__Link></p> : null}
              </div>
              <div className="ac-field">
                <label className="gc-label" htmlFor="ac-add-email">Email <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" }}>(optional)</span></label>
                <input id="ac-add-email" name="email" type="email" className={v.errEmail ? "gc-input gc-input--error" : "gc-input"} value={v.form?.email} onChange={v.typeField} aria-invalid={v.errEmail ? "true" : "false"} autoComplete="off" maxLength={80} />
                {v.errEmail ? ERR('ac-add-email-err', v.errEmail) : null}
              </div>
              <div className="ac-field">
                <label className="gc-label" htmlFor="ac-add-area">Address <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" }}>(optional)</span></label>
                <textarea id="ac-add-area" name="area" rows="2" className="gc-input" value={v.form?.area} onChange={v.typeField} placeholder="House, road, area and city" autoComplete="off" maxLength={160} />
              </div>
              {v.isCompanyForm ? (
                <div className="ly-two">
                  <div className="ac-field"><label className="gc-label" htmlFor="ac-add-bin">BIN / trade licence</label><input id="ac-add-bin" name="bin" className="gc-input" value={v.form?.bin} onChange={v.typeField} maxLength={30} /></div>
                  <div className="ac-field"><label className="gc-label" htmlFor="ac-add-terms">Payment terms</label><select id="ac-add-terms" name="terms" className="gc-input gc-select" value={v.form?.terms} onChange={v.typeField}><option>Pay on order</option><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></div>
                </div>
              ) : null}
              <fieldset className="ac-field ac-mgset" aria-describedby={v.errTypes ? "ac-add-type-err" : "ac-add-type-help"}>
                <legend className="gc-label">Customer type <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></legend>
                <div className="ac-types">
                  {CUST_TYPES.map((t) => { const on = (v.form?.types || []).indexOf(t) >= 0; return (
                    <label key={t} className={"ac-type" + (on ? " is-on" : "")}>
                      <input id={"ac-add-type-" + t} type="checkbox" className="gc-check" checked={on} onChange={() => v.toggleType(t)} />{t}
                    </label>); })}
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" aria-pressed={(v.form?.types || []).length === 3} onClick={() => v.toggleType('all')}>All three</button>
                </div>
                {v.errTypes ? ERR('ac-add-type-err', v.errTypes) : (<p id="ac-add-type-help" className="gc-help">Pick every way this customer buys from you.</p>)}
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
                  {v.errCredit ? ERR('ac-add-credit-err', v.errCredit) : (<p id="ac-add-credit-help" className="gc-help">The most this customer can owe you. 0 means no limit.</p>)}
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
                        <span className="mono ac-pair__sub">{c.phone} · {c.id}</span>
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
              <p className="gc-help" style={{ margin: "0" }}>{v.mergeDropName} is hidden from your lists. Their orders, spend and due are added to {v.mergeKeepName}. Their customer ID still finds {v.mergeKeepName}.</p>
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
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.saveView}>Save as a segment</button>
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
              <SegmentBuilder open={v.segOpen} segment={v.segEdit} rows={v.allRows} by={v.me} onClose={v.closeSeg} onSaved={v.savedSeg} />
              <__Dialog open={v.dlg === 'msg'} title="Send a message" onClose={v.closeDlg} width={480} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeDlg}>Cancel</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.sendMsg} disabled={!v.msgOk}>Continue in Communications</button>
              </>}>
                <div className="ac-form">
                  <div className="ix-chips" role="group" aria-label="Channel">{v.msgChans.map((c) => <button key={c.k} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.label} · {c.n}</button>)}</div>
                  <p className="crm-preview" role="status"><b className="ly-fig">{v.msgOk}</b><span>of {v.msgTotal} can get {v.msgChLabel}</span><small>Only customers who said yes to {v.msgChLabel} get it. The rest are left out.</small></p>
                </div>
              </__Dialog>
              <__Dialog open={v.dlg === 'tag'} title={v.tagMode === 'untag' ? 'Remove a tag' : 'Add a tag'} onClose={v.closeDlg} width={440} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeDlg}>Cancel</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.runTag}>{v.tagMode === 'untag' ? 'Remove from ' : 'Add to '}{v.selCount}</button>
              </>}>
                <div className="ac-form">
                  <div className="ix-chips" role="group" aria-label="Tags">{v.tagChips.map((c) => <button key={c.t} type="button" className="ix-chip" aria-pressed={c.on} onClick={c.pick}>{c.t}</button>)}</div>
                  <div className="ac-field"><label className="gc-label" htmlFor="ac-tag">Tag</label><input id="ac-tag" className="gc-input" value={v.tagVal} onChange={v.typeTag} maxLength={30} placeholder="e.g. Eid buyer" /></div>
                </div>
              </__Dialog>
              <__Dialog open={v.dlg === 'seg'} title="Add to a segment" onClose={v.closeDlg} width={440} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeDlg}>Cancel</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.runSeg}>Add {v.selCount}</button>
              </>}>
                <div className="ac-field"><label className="gc-label" htmlFor="ac-seg">Segment</label>
                  <select id="ac-seg" className="gc-input gc-select" value={v.segPick} onChange={v.setSegPick}>{v.segs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <p className="gc-help">They stay in it even if they stop matching its rules.</p>
                </div>
              </__Dialog>
              <__Dialog open={v.dlg === 'consent'} title="Change consent" onClose={v.closeDlg} width={480} footer={<>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeDlg}>Cancel</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.runConsent}>Change for {v.selCount}</button>
              </>}>
                <div className="ac-form">
                  <div className="ly-two">
                    <div className="ac-field"><label className="gc-label" htmlFor="ac-c-ch">Channel</label><select id="ac-c-ch" className="gc-input gc-select" value={v.cCh} onChange={v.setCCh}>{CONSENT_CHANNELS.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}</select></div>
                    <div className="ac-field"><label className="gc-label" htmlFor="ac-c-st">Set to</label><select id="ac-c-st" className="gc-input gc-select" value={v.cSt} onChange={v.setCSt}>{Object.keys(CONSENT_STATES).map((k) => <option key={k} value={k}>{CONSENT_STATES[k]}</option>)}</select></div>
                  </div>
                  <div className="ac-field"><label className="gc-label" htmlFor="ac-c-src">Where it came from</label><select id="ac-c-src" className="gc-input gc-select" value={v.cSrc} onChange={v.setCSrc}>{CONSENT_SOURCES.map((x) => <option key={x}>{x}</option>)}</select>
                    <p className="gc-help">Only record a yes the customer gave you. Each change is kept with its source and time.</p></div>
                </div>
              </__Dialog>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
