'use client';
// Generated from design/templates/merchant-overview/MerchantOverview.dc.html by scripts/convert-design.mjs.
// Home — Home — branch selector for every widget, five widgets on by default, including Quick actions and Needs attention today, more added from the Customise panel in half or full width, saved per staff member.
// Edit freely: this file is now the source for the screen.
// Live numbers (read in this browser after mount, on top of the demo branch figures):
//   Sales today / Orders   demo figures + today's POS sales (gc.pos.sales), by the branch they were sold at
//   Orders to confirm      real Pending orders; the pipeline's To confirm / To pack are Pending / Approved
//   Low stock              every product and place with 5 or fewer free to sell (stockAt)
//   Needs attention        unpaid invoices (sum of what is due), orders waiting, low stock and damaged
//                          stock from the real data; supplier bills, expiry, warranty and AI calls stay demo

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { POS_KEYS, load } from '@/lib/posStore';
import { getInvoices } from '@/lib/invoices';
import { getOrders, isCounterSale, orderHref } from '@/lib/orders';
import { CATALOG, stockAt, getMoves } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { getTransfers } from '@/lib/transfers';
import { getStockPlaces, namesOf } from '@/lib/locations';

// ---- logic (from the design's <script type="text/x-dc">) ----

function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
var ORDER_FILTERS = ['all', 'Pending', 'Shipped', 'Delivered'];
var LOW_AT = 5;   // a product is low at a place when 5 or fewer are free to sell there

/** Which Home branch a place, counter or channel belongs to: dh, mp, on (online / Central Warehouse) or '' (all only). */
function branchOf(text) {
  var t = String(text || '');
  if (/Dhanmondi/.test(t)) return 'dh';
  if (/Mirpur/.test(t)) return 'mp';
  if (/Central Warehouse/.test(t)) return 'on';
  return '';
}
/** Everything Home shows from this browser's data. */
function readLive() {
  var start = new Date(); start.setHours(0, 0, 0, 0);
  var sales = load(POS_KEYS.sales, []).filter(function (x) { return x.at >= start.getTime(); })
    .map(function (x) { return { br: branchOf(x.place || x.counter), amount: (x.totals && x.totals.total) || 0 }; });
  var invoices = getInvoices().filter(function (r) { return r.due > 0; })
    .map(function (r) { return { id: r.id, name: (r.customer && r.customer.name) || 'Walk-in customer', due: r.due, br: branchOf(r.place || r.counter) }; });
  var orders = getOrders().filter(function (o) { return ['onhold', 'processing', 'pending', 'approved'].includes(o.statusKey); })
    .map(function (o) {
      return { id: o.id, cust: o.customer, phone: String(o.phone || '').replace(/[^0-9]/g, ''), status: o.statusKey, amt: o.amount, at: o.at, href: orderHref(o.id),
        br: isCounterSale(o) ? branchOf(o.channel) : 'on', meta: o.id + ' · ' + o.channel + ' · ' + o.placed + ' · ' + o.payment };
    }).sort(function (a, b) { return b.at - a.at; });
  var holds = getHolds(), moves = getMoves(), transfers = getTransfers();
  var low = [];
  // every active stock place (live list): a product counts where it is stocked (base count or on hand)
  var live = getStockPlaces();
  CATALOG.forEach(function (p) {
    live.forEach(function (place) {
      var st = stockAt(p.sku, place, holds, moves, transfers);
      var stocked = st.onHand > 0 || namesOf(place).some(function (n) { return ((p.on || {})[n] || 0) > 0; });
      if (!stocked) return;
      var left = st.available;
      if (left <= LOW_AT) low.push({ name: p.name, sku: p.sku, place: place, left: left, br: branchOf(place) });
    });
  });
  low.sort(function (a, b) { return a.left - b.left; });
  var damaged = holds.filter(function (h) { return h.status === 'damaged'; });
  return { sales: sales, invoices: invoices, orders: orders, low: low, damaged: damaged };
}

class Component extends DCLogic {
  state = { branch: 'all', menu: false, panel: null, filter: 'all', layout: null };
  componentDidMount() {
    this.paint();
    this.setState({ live: readLive() });
    // Filters kept in the URL: ?orders=pending|shipped|delivered and ?branch=dh|mp|on
    var p = {}, o = getQuery('orders'), b = getQuery('branch');
    var f = ORDER_FILTERS.filter(function (k) { return k.toLowerCase() === o; })[0];
    if (f && f !== 'all') p.filter = f;
    if (['dh', 'mp', 'on'].indexOf(b) >= 0) p.branch = b;
    if (Object.keys(p).length) this.setState(p);
  }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  defaults() {
    return [
      { id: 'quick', on: true, size: 'full' },
      { id: 'sales', on: true, size: 'full' },
      { id: 'confirm', on: true, size: 'half' },
      { id: 'attention', on: true, size: 'half' },
      { id: 'cash', on: false, size: 'half' },
      { id: 'pipeline', on: true, size: 'full' },
      { id: 'orders', on: false, size: 'half' },
      { id: 'lowStock', on: false, size: 'half' },
      { id: 'visitors', on: false, size: 'half' },
      { id: 'target', on: false, size: 'half' },
      { id: 'carts', on: false, size: 'half' },
      { id: 'top', on: false, size: 'half' }
    ];
  }
  renderVals() {
    const money = (n) => '৳' + Math.round(n).toLocaleString('en-IN');
    const locked = this.props.singleBranchStaff ?? false;
    const br = locked ? 'dh' : this.state.branch;
    const IDS = ['dh', 'mp', 'on'];
    const BR = {
      dh: { name: 'Dhanmondi branch', tag: 'DH', meta: 'DH-1 · shop · 4 staff', profit: 11420, cash: 18450, cashNote: 'counted at 2:10 PM', week: [38200, 42100, 35400, 51300, 47000, 44000, 48650], orders: 23, pipe: [3, 5, 4, 12, 9, 1] },
      mp: { name: 'Mirpur branch', tag: 'MP', meta: 'MP-1 · shop · 3 staff', profit: 7340, cash: 9820, cashNote: 'counted at 1:45 PM', week: [29100, 33000, 30200, 27400, 35100, 32700, 31200], orders: 16, pipe: [2, 3, 2, 7, 6, 0] },
      on: { name: 'Online store', tag: 'WEB', meta: 'Ships from Central Warehouse', profit: 14910, cash: 0, cashNote: 'no cash drawer online', week: [41000, 48300, 52100, 45600, 58200, 51500, 62480], orders: 38, pipe: [6, 8, 5, 21, 15, 2] }
    };
    const sum = (f) => IDS.reduce((a, id) => a + f(BR[id]), 0);
    const pick = (id) => id === 'all'
      ? { name: 'All branches', profit: sum(b => b.profit), cash: sum(b => b.cash), cashNote: 'Dhanmondi + Mirpur drawers', orders: sum(b => b.orders), week: [0,1,2,3,4,5,6].map(i => sum(b => b.week[i])), pipe: [0,1,2,3,4,5].map(i => sum(b => b.pipe[i])) }
      : BR[id];
    const base = pick(br);
    const inBr = (x) => br === 'all' || x.br === br;
    // live data from this browser (empty on the first render)
    const live = this.state.live || { sales: [], invoices: [], orders: [], low: [], damaged: [] };
    const liveSales = live.sales.filter(inBr);
    const liveAmt = liveSales.reduce((a, x) => a + x.amount, 0);
    const cur = { ...base, orders: base.orders + liveSales.length, week: base.week.map((v, i) => (i === 6 ? v + liveAmt : v)) };
    const waiting = live.orders.filter(inBr);
    const toConfirm = waiting.filter((o) => o.status !== 'approved');
    const toPack = waiting.filter((o) => o.status === 'approved');
    const dues = live.invoices.filter(inBr);
    const dueSum = dues.reduce((a, r) => a + r.due, 0);
    const lowLive = live.low.filter(inBr);
    const damagedPcs = live.damaged.reduce((a, h) => a + h.qty, 0);

    // KPIs
    const today = cur.week[6], yest = cur.week[5];
    const chg = ((today - yest) / yest) * 100;
    const COUR = [
      { name: 'Pathao', next: 'payout Thu 1 Oct', v: { dh: 12400, mp: 5100, on: 31200 } },
      { name: 'Steadfast', next: 'payout Fri 2 Oct', v: { dh: 6900, mp: 3800, on: 15600 } },
      { name: 'RedX', next: 'payout Sun 4 Oct', v: { dh: 3000, mp: 0, on: 7800 } }
    ];
    const courVal = (c) => br === 'all' ? IDS.reduce((a, id) => a + c.v[id], 0) : c.v[br];
    const cod = COUR.reduce((a, c) => a + courVal(c), 0);
    const chanNote = br === 'all' ? '38 online · 39 in shops' : (br === 'on' ? 'all online' : 'walk-in and phone');

    // Bars
    const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Today'];
    const max = Math.max(...cur.week);
    const bars = cur.week.map((v, i) => ({
      label: (v / 1000).toFixed(1) + 'k',
      h: Math.round((v / max) * 96) + 'px',
      col: i === 6 ? '#003087' : '#c7d4ea',
      day: days[i], dayCol: i === 6 ? '#003087' : 'var(--text-muted)', dayW: i === 6 ? 'var(--weight-semibold)' : 'var(--weight-regular)'
    }));

    // Orders to confirm
    const CONF = [
      { cust: 'Nusrat Jahan', phone: '01711482093', br: 'on', meta: '#ORD-0929-014 · online · 8 min ago · COD', amt: 2450 },
      { cust: 'Rakibul Hasan', phone: '01819330214', br: 'dh', meta: '#ORD-0929-012 · Dhanmondi · 22 min ago · COD', amt: 1180 },
      { cust: 'Tanvir Ahmed', phone: '01912554018', br: 'mp', meta: '#ORD-0929-010 · Mirpur · 1 h ago · COD', amt: 890, risk: true },
      { cust: 'Farhana Akter', phone: '01552907731', br: 'on', meta: '#ORD-0929-011 · online · 41 min ago · bKash paid', amt: 3960 },
      { cust: 'Sumaiya Islam', phone: '01678220415', br: 'dh', meta: '#ORD-0929-008 · Dhanmondi · 2 h ago · COD', amt: 1540 },
      { cust: 'Arif Chowdhury', phone: '01744906632', br: 'mp', meta: '#ORD-0929-006 · Mirpur · 3 h ago · COD', amt: 2210 },
      { cust: 'Mehedi Hasan', phone: '01999127740', br: 'on', meta: '#ORD-0929-005 · online · 3 h ago · COD', amt: 760 }
    ];
    const confirmRows = this.state.live
      ? toConfirm.slice(0, 4).map(o => ({ cust: o.cust, phone: o.phone, meta: o.meta, amt: money(o.amt), risk: false, href: o.href }))
      : CONF.filter(inBr).slice(0, 4).map(o => ({ ...o, amt: money(o.amt), risk: !!o.risk, href: '/merchant-orders?status=pending' }));

    // Pipeline
    const PL = [['To confirm', '#ff9800'], ['To pack', '#009cde'], ['Ready to ship', '#003087'], ['With courier', '#7c3aed'], ['Delivered today', '#10b981'], ['Returned', '#f97362']];
    const pipe = PL.map((p, i) => ({ label: p[0], dot: p[1], n: this.state.live && i === 0 ? toConfirm.length : this.state.live && i === 1 ? toPack.length : cur.pipe[i] }));

    // Latest orders
    const ST = { Pending: ['rgba(255,152,0,.14)', '#9a5b00'], Processing: ['rgba(0,156,222,.14)', '#0074a6'], Shipped: ['rgba(0,48,135,.1)', '#003087'], Delivered: ['rgba(16,185,129,.14)', '#047857'] };
    const LATEST = [
      { cust: 'Nusrat Jahan', br: 'on', where: 'Online', time: '2:32 PM', status: 'Pending', amt: 2450 },
      { cust: 'Walk-in customer', br: 'dh', where: 'Dhanmondi POS', time: '2:18 PM', status: 'Delivered', amt: 640 },
      { cust: 'Rakibul Hasan', br: 'dh', where: 'Dhanmondi', time: '2:05 PM', status: 'Pending', amt: 1180 },
      { cust: 'Shila Rahman', br: 'on', where: 'Online', time: '1:48 PM', status: 'Processing', amt: 1720 },
      { cust: 'Walk-in customer', br: 'mp', where: 'Mirpur POS', time: '1:30 PM', status: 'Delivered', amt: 910 },
      { cust: 'Jubayer Alam', br: 'on', where: 'Online', time: '12:55 PM', status: 'Shipped', amt: 3340 },
      { cust: 'Tanvir Ahmed', br: 'mp', where: 'Mirpur', time: '12:20 PM', status: 'Pending', amt: 890 }
    ];
    const f = this.state.filter;
    const latest = LATEST.filter(inBr).filter(o => f === 'all' || o.status === f).slice(0, 5).map(o => ({
      cust: o.cust, meta: o.where + ' · ' + o.time, status: o.status, amt: money(o.amt), sbg: ST[o.status][0], scol: ST[o.status][1]
    }));
    const filters = ORDER_FILTERS.map(k => ({
      label: k === 'all' ? 'All' : k, on: f === k,
      bg: f === k ? '#003087' : '#fff', col: f === k ? '#fff' : '#475569', bd: f === k ? '#003087' : '#e2e8f0',
      pick: () => { this.setState({ filter: k }); setQuery('orders', k === 'all' ? '' : k.toLowerCase()); }
    }));

    // Low stock
    const LOW = [
      { name: 'Tempered Glass Screen Protector — 2 pack', sku: 'TG-2P', br: 'dh', left: 2, min: 10 },
      { name: 'Shockproof Bumper Case — 16 Pro Max', sku: 'SB-16PM', br: 'mp', left: 4, min: 8 },
      { name: '20W USB-C Fast Charger', sku: 'CH-20W', br: 'dh', left: 5, min: 12 },
      { name: 'Braided Lightning Cable 1 m', sku: 'LC-1M', br: 'mp', left: 0, min: 15 },
      { name: 'MagSafe Clear Case — 15', sku: 'MS-15', br: 'on', left: 3, min: 6 }
    ];
    const brShort = { dh: 'Dhanmondi', mp: 'Mirpur', on: 'Online stock' };
    const low = this.state.live
      ? lowLive.slice(0, 4).map(s => ({ name: s.name, left: s.left, min: LOW_AT, meta: s.sku + ' · ' + s.place, col: s.left === 0 ? '#b8330f' : '#9a5b00' }))
      : LOW.filter(inBr).slice(0, 4).map(s => ({ ...s, meta: s.sku + ' · ' + brShort[s.br], col: s.left === 0 ? '#b8330f' : '#9a5b00' }));

    // Top products
    const TOP = [
      { name: 'Shockproof Bumper Case — 16 Pro Max', price: 1000, q: { dh: 4, mp: 3, on: 7 } },
      { name: '20W USB-C Fast Charger', price: 850, q: { dh: 4, mp: 2, on: 5 } },
      { name: 'Tempered Glass Screen Protector — 2 pack', price: 300, q: { dh: 8, mp: 6, on: 5 } },
      { name: 'Braided Lightning Cable 1 m', price: 350, q: { dh: 2, mp: 1, on: 6 } },
      { name: 'MagSafe Clear Case — 15', price: 1200, q: { dh: 1, mp: 0, on: 3 } }
    ];
    const qOf = (t) => br === 'all' ? IDS.reduce((a, id) => a + t.q[id], 0) : t.q[br];
    const top = TOP.map(t => ({ name: t.name, qty: qOf(t), rev: qOf(t) * t.price })).filter(t => t.qty > 0)
      .sort((a, b) => b.rev - a.rev).slice(0, 4).map((t, i) => ({ rank: String(i + 1), name: t.name, qty: t.qty, amt: money(t.rev) }));

    // Quick actions and needs-attention list
    const quick = [
      // Each tile carries its intent in the URL so the destination opens in the right mode.
      { l: 'New sale', s: 'Memo at the counter', icon: 'receipt', href: '/pos' },
      { l: 'Purchase order', s: 'Order goods from a supplier', icon: 'package-plus', href: '/new-po' },
      { l: 'Money received', s: 'Due collected', icon: 'arrow-down-left', href: '/money-in-out?type=in' },
      { l: 'Money paid', s: 'Supplier or bill', icon: 'arrow-up-right', href: '/money-in-out?type=out' },
      { l: 'Add expense', s: 'Rent, bills, ads', icon: 'wallet', href: '/expenses' },
      { l: 'Return', s: 'Refund or exchange', icon: 'undo-2', href: '/return-exchange?mode=ret' }
    ];
    const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
    const LIVE_ATT = !this.state.live ? [] : [
      dues.length ? { t: plural(dues.length, 'unpaid invoice', 'unpaid invoices'), s: 'To collect · oldest: ' + dues[dues.length - 1].name, amt: dueSum, br: 'all', cta: 'Collect', href: '/sales-invoices', tone: 'late' } : null,
      waiting.length ? { t: plural(waiting.length, 'order waiting', 'orders waiting'), s: toConfirm.length + ' to confirm · ' + toPack.length + ' to pack', amt: null, br: 'all', cta: 'Open', href: '/merchant-orders?status=pending', tone: 'due' } : null,
      lowLive.length ? { t: plural(lowLive.length, 'product almost out of stock', 'products almost out of stock'), s: 'Most urgent: ' + lowLive[0].name + ' · ' + lowLive[0].left + ' left at ' + lowLive[0].place, amt: null, br: 'all', cta: 'Order goods', href: '/purchase-orders', tone: 'stock' } : null,
      live.damaged.length && (br === 'all' || br === 'on') ? { t: plural(damagedPcs, 'damaged piece', 'damaged pieces') + ' set aside', s: 'Write off, send back or put on sale again', amt: null, br: 'all', cta: 'Review', href: '/expiry-disposal', tone: 'info' } : null,
    ].filter(Boolean);
    const ATT = [
      { t: '3 suppliers due today', s: 'Dhaka Gadget Hub, Techland, Mobile Mart', amt: 85000, br: 'all', cta: 'Pay now', href: '../purchase-stock/Suppliers.dc.html', tone: 'due' },
      ...(this.state.live ? LIVE_ATT : [
        { t: '4 unpaid invoices', s: 'Collect payment or send the invoice again', amt: 97000, br: 'all', cta: 'Open', href: '../sales/SalesInvoices.dc.html', tone: 'late' },
        { t: '7 products almost out of stock', s: 'Most urgent: Braided Lightning Cable 1 m', amt: null, br: 'all', cta: 'Order goods', href: '../purchase-stock/PurchaseOrders.dc.html', tone: 'stock' },
      ]),
      { t: '4 items expire within 15 days', s: 'Batteries and cleaning sprays at cost', amt: 6420, br: 'all', cta: 'Review', href: '../purchase-stock/ExpiryDisposal.dc.html', tone: 'stock' },
      { t: '5 warranty claims waiting', s: '2 are back from the service centre', amt: null, br: 'dh', cta: 'Open', href: '../purchase-stock/WarrantyClaims.dc.html', tone: 'info' },
      { t: '1 AI call needs a person', s: 'Nusrat Jahan wants a different colour', amt: null, br: 'on', cta: 'Call', href: '../ai-call/AiCalls.dc.html', tone: 'info' }
    ];
    const TONE = { due: ['#fff4e0', '#a14f06'], late: ['#ffece6', '#b83210'], stock: ['#e0f2fe', '#075985'], info: ['rgba(0,48,135,.08)', '#003087'] };
    const attention = ATT.filter(x => x.br === 'all' || inBr(x)).map(x => ({ ...x, amt: x.amt ? money(x.amt) : '', hasAmt: !!x.amt, bg: TONE[x.tone][0], fg: TONE[x.tone][1] }));

    // Monthly target (month to date, 29 of 30 days)
    const TGT = { dh: 1400000, mp: 1000000, on: 1600000 };
    const mtdOf = (id) => Math.round(BR[id].week.reduce((a, v) => a + v, 0) / 7 * 29);
    const mtd = br === 'all' ? IDS.reduce((a, id) => a + mtdOf(id), 0) : mtdOf(br);
    const tgt = br === 'all' ? IDS.reduce((a, id) => a + TGT[id], 0) : TGT[br];
    const tPct = Math.min(100, Math.round(mtd / tgt * 100));
    const target = { mtd: money(mtd), tgt: money(tgt), pct: tPct + '%', barW: tPct + '%', barCol: tPct >= 100 ? '#047857' : '#003087',
      note: mtd >= tgt ? 'Target reached with 1 day to go.' : money(tgt - mtd) + ' to go · 1 day left in September' };

    // Widget layout (saved per staff login)
    const META = {
      sales: { name: 'Sales', icon: 'trending-up', desc: 'Today’s sales, orders, profit and the last 7 days.' },
      confirm: { name: 'Orders to confirm', icon: 'clock', desc: 'New orders waiting for a call or confirmation.' },
      cash: { name: 'Cash in hand & COD due', icon: 'wallet', desc: 'Drawer cash and money still with couriers.' },
      pipeline: { name: 'Fulfilment pipeline', icon: 'workflow', desc: 'How many orders sit at each stage.' },
      orders: { name: 'Latest orders', icon: 'receipt', desc: 'The newest orders from every channel.' },
      lowStock: { name: 'Low stock', icon: 'alert-triangle', desc: 'Products under their alert level.' },
      visitors: { name: 'Store visitors', icon: 'eye', desc: 'From your own storefront tracking.' },
      carts: { name: 'Abandoned carts', icon: 'shopping-bag', desc: 'Carts left after the phone number was typed.' },
      top: { name: 'Top products', icon: 'award', desc: 'Best sellers today by revenue.' },
      target: { name: 'Monthly target', icon: 'target', desc: 'Sales so far this month against the target.' },
      quick: { name: 'Quick actions', icon: 'zap', desc: 'New sale, buy goods, money in and out, expense, return.' },
      attention: { name: 'Needs attention today', icon: 'bell-ring', desc: 'Dues, low stock, expiring goods and anything waiting on you.' }
    };
    const layout = this.state.layout ?? this.defaults();
    const setLayout = (fn) => this.setState(s => ({ layout: fn((s.layout ?? this.defaults()).map(x => ({ ...x }))) }));
    const w = {};
    layout.forEach((x, i) => { w[x.id] = { disp: x.on ? 'flex' : 'none', col: x.size === 'full' ? 'span 2' : 'span 1', order: i }; });
    const panelRows = layout.map((x, i) => ({
      ...META[x.id], on: x.on ? 'true' : 'false',
      op: x.on ? 1 : 0.55,
      track: x.on ? '#003087' : '#cbd5e1', knob: x.on ? 'flex-end' : 'flex-start',
      halfBg: x.size === 'half' ? '#fff' : 'transparent', halfCol: x.size === 'half' ? '#003087' : '#64748b',
      fullBg: x.size === 'full' ? '#fff' : 'transparent', fullCol: x.size === 'full' ? '#003087' : '#64748b',
      toggle: () => setLayout(l => { l[i].on = !l[i].on; return l; }),
      half: () => setLayout(l => { l[i].size = 'half'; return l; }),
      full: () => setLayout(l => { l[i].size = 'full'; return l; }),
      up: () => setLayout(l => { if (i > 0) { const t = l[i - 1]; l[i - 1] = l[i]; l[i] = t; } return l; }),
      down: () => setLayout(l => { if (i < l.length - 1) { const t = l[i + 1]; l[i + 1] = l[i]; l[i] = t; } return l; })
    }));
    const hidden = layout.filter(x => !x.on).length;

    const branchOptions = ['all', ...IDS].map(id => {
      const b = pick(id);
      return {
        name: b.name, tag: id === 'all' ? 'ALL' : BR[id].tag,
        meta: id === 'all' ? '3 active branches' : BR[id].meta,
        sales: money(b.week[6] + live.sales.filter(x => id === 'all' || x.br === id).reduce((a, x) => a + x.amount, 0)), bg: br === id ? 'rgba(0,48,135,.06)' : 'transparent',
        on: br === id,
        pick: () => { this.setState({ branch: id, menu: false }); setQuery('branch', id === 'all' ? '' : id); }
      };
    });

    const panelOpen = this.state.panel ?? (this.props.panelOpen ?? false);
    const pipeAll = this.state.live ? toConfirm.length : cur.pipe[0];
    return {
      bilingual: this.props.bilingual ?? false,
      locked, unlocked: !locked,
      branchName: cur.name,
      branchMenuOpen: this.state.menu && !locked,
      toggleBranchMenu: () => { if (!locked) this.setState(s => ({ menu: !s.menu })); },
      branchOptions,
      k: {
        sales: money(today), chg: Math.abs(chg).toFixed(1) + '%', chgIcon: chg >= 0 ? 'trending-up' : 'trending-down', chgWord: chg >= 0 ? 'Up' : 'Down', chgCol: chg >= 0 ? '#047857' : '#b8330f',
        orders: String(cur.orders), channels: chanNote,
        profit: money(cur.profit), aov: money(today / cur.orders),
        cash: money(cur.cash), cashNote: cur.cashNote, cod: money(cod)
      },
      bars,
      couriers: COUR.map(c => ({ name: c.name, next: c.next, amt: money(courVal(c)) })),
      confirmCount: String(pipeAll), confirmRows, noConfirm: confirmRows.length === 0,
      pipe, pipeCols: 6,
      filters, latest, noLatest: latest.length === 0,
      low, noLow: low.length === 0,
      vis: { live: br === 'all' || br === 'on' ? '14' : '0', show: br === 'all' || br === 'on', hide: !(br === 'all' || br === 'on') },
      top, target, quick, attention, attCount: String(attention.length),
      w,
      addDisp: hidden > 0 ? 'flex' : 'none', addNote: hidden + ' more available',
      panelOpen, panelRows,
      openPanel: () => this.setState({ panel: true, menu: false }),
      closePanel: () => this.setState({ panel: false }),
      resetLayout: () => this.setState({ layout: null }),
      hiddenNote: hidden > 0 ? hidden + ' widgets are hidden. Turn them on from Customise.' : 'All widgets are on.'
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}.bn{font-family:var(--font-bn)}table{border-collapse:collapse}
.dc-h221:hover{border-color:#94a3b8 !important}
.dc-h222:hover{background:#f1f5f9 !important}
.dc-h223:hover{border-color:#94a3b8 !important}
.dc-h224:hover{background:#002a77 !important}
.dc-h225:hover{border-color:#94a3b8 !important}
.dc-h226:hover{border-color:#003087 !important;background:rgba(0,48,135,.03) !important}
.dc-h227:hover{border-color:#003087 !important;color:#003087 !important;background:rgba(0,48,135,.03) !important}
.dc-h228:hover{background:#f1f5f9 !important;color:#475569 !important}
.dc-h229:hover{border-color:#94a3b8 !important}
.dc-h230:hover{border-color:#94a3b8 !important}
.dc-h231:hover{border-color:#94a3b8 !important}
.dc-h232:hover{background:#002a77 !important}
.mo-quick{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));grid-auto-rows:1fr;gap:var(--grid-gap,10px)}
.mo-quick__tile:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
@media (max-width:420px){.mo-quick{grid-template-columns:repeat(2,minmax(0,1fr))}}
.mo-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

// ---- markup ----

export default class MerchantOverviewScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MerchantOverview">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="home" />
          <div className="gc-shell__main" style={{ position: "relative", flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <div style={{ flex: "1", minHeight: "0", overflowY: "auto" }}>
              <__Topbar crumb="Home" page="Home" />
              <main className="gc-shell__content" style={{ padding: "24px 32px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px", justifyContent: "space-between" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Good afternoon{v.bilingual ? (<>
  <span className="bn" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", marginLeft: "10px" }}>শুভ অপরাহ্ন</span>
</>) : null}</h1>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Tue, 29 Sep 2026 · Asia/Dhaka · showing today for <strong style={{ fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.branchName}</strong></p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ position: "relative" }}>
                      <button className="dc-h221" onClick={v.toggleBranchMenu} disabled={v.locked} style={{ display: "inline-flex", height: "36px", minWidth: "220px", alignItems: "center", gap: "10px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", cursor: "pointer" }} aria-label={`Branch: ${v.branchName ?? ""}. Change branch`} aria-haspopup="true" aria-expanded={v.branchMenuOpen}>
                        <__Icon name="store" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />
                        <span style={{ flex: "1", textAlign: "left", whiteSpace: "nowrap" }}>{v.branchName}</span>
                        {v.locked ? (<>
                          <__Icon name="lock" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                        </>) : null}
                        {v.unlocked ? (<>
                          <__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} />
                        </>) : null}
                      </button>
                      {v.branchMenuOpen ? (<>
                        <div style={{ position: "absolute", right: "0", top: "44px", zIndex: "120", width: "300px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 18px 40px -12px rgba(15,23,42,.28)", padding: "6px" }}>
                          <span style={{ display: "block", padding: "8px 10px 6px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Show activity for</span>
                          {__list(v.branchOptions).map((b, $index) => (<React.Fragment key={$index}>
                              <button className="dc-h222" type="button" aria-pressed={b?.on} onClick={b?.pick} style={__sx(`display:flex;width:100%;align-items:center;gap:10px;border:none;border-radius:var(--radius-lg);background:${b?.bg ?? ""};padding:9px 10px;font-family:inherit;text-align:left;cursor:pointer`)}>
                                <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)" }}>{b?.tag}</span>
                                <span style={{ flex: "1", minWidth: "0" }}>
                                  <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{b?.name}</span>
                                  <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{b?.meta}</span>
                                </span>
                                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{b?.sales}</span>
                              </button>
                            </React.Fragment>))}
                          <div style={{ margin: "6px 4px 2px", padding: "10px 8px 6px", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Uttara branch opens 1 Nov 2026 and joins this list once it goes live. Staff assigned to one branch only see that branch.</div>
                        </div>
                      </>) : null}
                    </div>
                    <button className="dc-h223" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}><__Icon name="calendar" strokeWidth="1.75" width="17" height="17" />Today<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" style={{ color: "var(--text-muted)" }} /></button>
                    <button className="dc-h224" onClick={v.openPanel} style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff", cursor: "pointer" }}><__Icon name="layout-grid" strokeWidth="1.75" width="17" height="17" />Customise</button>
                  </div>
                </div>
                {v.locked ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "10px 14px", fontSize: "var(--text-xs-plus)", color: "#003087" }}><__Icon name="info" strokeWidth="1.75" width="16" height="16" />You are assigned to Dhanmondi branch, so every number here is for that branch only.</div>
                </>) : null}
                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "16px", alignItems: "start" }}>
                  <section style={__sx(`grid-column:${v.w?.sales?.col ?? ""};order:${v.w?.sales?.order ?? ""};display:${v.w?.sales?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:20px 24px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="trending-up" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Sales</h2>
                      <__Link href="/attribution" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Full report</__Link>
                    </div>
                    <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px", marginTop: "16px" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Sales today</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.sales}</span>
                        <span style={__sx(`display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:${v.k?.chgCol ?? ""}`)}><__Icon name={v.k?.chgIcon} strokeWidth="1.75" width="14" height="14" aria-hidden="true" /><span className="mo-sr">{v.k?.chgWord}</span>{v.k?.chg}<span style={{ fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>vs yesterday</span></span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Orders</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.orders}</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.k?.channels}</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Profit</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.profit}</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>after product cost</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Average order</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.aov}</span>
                        <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>per order today</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "150px", marginTop: "20px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                      {__list(v.bars).map((bar, $index) => (<React.Fragment key={$index}>
                          <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{bar?.label}</span>
                            <span style={__sx(`display:block;width:100%;max-width:64px;height:${bar?.h ?? ""};border-radius:var(--radius-md) var(--radius-md) 2px 2px;background:${bar?.col ?? ""}`)} />
                            <span style={__sx(`font-size:var(--text-xs);color:${bar?.dayCol ?? ""};font-weight:${bar?.dayW ?? ""}`)}>{bar?.day}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.confirm?.col ?? ""};order:${v.w?.confirm?.order ?? ""};display:${v.w?.confirm?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="clock" strokeWidth="1.75" width="17" height="17" style={{ color: "#9a5b00" }} />Orders to confirm<span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,152,0,.14)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#9a5b00" }}>{v.confirmCount}</span></h2>
                      <__Link href="/merchant-orders" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>View all</__Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
                      {__list(v.confirmRows).map((o, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ flex: "1", minWidth: "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{o?.cust}{o?.risk ? (<>
  <span style={{ display: "inline-flex", height: "18px", alignItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.1)", padding: "0 6px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "#b8330f" }}>2 of 5 returned</span>
</>) : null}</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{o?.meta}</span>
                            </span>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{o?.amt}</span>
                            <__A href={`tel:${o?.phone ?? ""}`} style={{ width: "32px", height: "32px", flex: "none", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", color: "#475569" }} aria-label={`Call ${o?.cust ?? ""}`}>
                              <__Icon name="phone" strokeWidth="1.75" width="15" height="15" />
                            </__A>
                            <__Link href={o?.href ?? "/merchant-orders"} style={{ display: "inline-flex", height: "32px", flex: "none", alignItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>Confirm</__Link>
                          </div>
                        </React.Fragment>))}
                      {v.noConfirm ? (<>
                        <p style={{ margin: "0", padding: "18px 0 6px", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Nothing waiting. New orders show here first.</p>
                      </>) : null}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.cash?.col ?? ""};order:${v.w?.cash?.order ?? ""};display:${v.w?.cash?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="wallet" strokeWidth="1.75" width="17" height="17" style={{ color: "#047857" }} />{"Cash in hand & COD due"}</h2>
                      <__Link href="/set-delivery" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Couriers</__Link>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                      <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 14px" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Cash in drawer</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.cash}</span>
                        <span style={{ display: "block", marginTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.k?.cashNote}</span>
                      </div>
                      <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 14px" }}>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>COD with couriers</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.k?.cod}</span>
                        <span style={{ display: "block", marginTop: "2px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>not paid out yet</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
                      {__list(v.couriers).map((c, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)" }}>
                            <__Icon name="truck" strokeWidth="1.75" width="15" height="15" style={{ color: "var(--text-muted)" }} />
                            <span style={{ flex: "1", color: "#334155" }}>{c?.name}<span style={{ marginLeft: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c?.next}</span></span>
                            <span style={{ fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{c?.amt}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.pipeline?.col ?? ""};order:${v.w?.pipeline?.order ?? ""};display:${v.w?.pipeline?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="workflow" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Fulfilment pipeline</h2>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Live · updates as orders move</span>
                    </div>
                    <div style={__sx(`display:grid;grid-template-columns:repeat(${v.pipeCols ?? ""},minmax(0,1fr));gap:10px;margin-top:14px`)}>
                      {__list(v.pipe).map((p, $index) => (<React.Fragment key={$index}>
                          <__Link className="dc-h225" href="/merchant-orders" style={{ display: "block", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "12px 14px", color: "inherit" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={__sx(`width:8px;height:8px;border-radius:var(--radius-full);background:${p?.dot ?? ""}`)} />{p?.label}</span>
                            {" "}
                            <span style={{ display: "block", marginTop: "6px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{p?.n}</span>
                          </__Link>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.orders?.col ?? ""};order:${v.w?.orders?.order ?? ""};display:${v.w?.orders?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="receipt" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Latest orders</h2>
                      <__Link href="/merchant-orders" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>All orders</__Link>
                    </div>
                    <div role="group" aria-label="Filter latest orders by status" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                      {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                          <button type="button" aria-pressed={f?.on} onClick={f?.pick} style={__sx(`display:inline-flex;height:28px;align-items:center;border:1px solid ${f?.bd ?? ""};border-radius:var(--radius-full);background:${f?.bg ?? ""};padding:0 11px;font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:${f?.col ?? ""};cursor:pointer`)}>{f?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                      {__list(v.latest).map((o, $index) => (<React.Fragment key={$index}>
                          <__Link href="/order-detail" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #f1f5f9", color: "inherit" }}>
                            <span style={{ flex: "1", minWidth: "0" }}>
                              <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{o?.cust}</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{o?.meta}</span>
                            </span>
                            <span style={__sx(`display:inline-flex;height:22px;align-items:center;border-radius:var(--radius-full);background:${o?.sbg ?? ""};padding:0 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:${o?.scol ?? ""}`)}>{o?.status}</span>
                            <span style={{ width: "76px", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{o?.amt}</span>
                          </__Link>
                        </React.Fragment>))}
                      {v.noLatest ? (<>
                        <p style={{ margin: "0", padding: "18px 0 6px", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>No orders with this status today.</p>
                      </>) : null}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.lowStock?.col ?? ""};order:${v.w?.lowStock?.order ?? ""};display:${v.w?.lowStock?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="alert-triangle" strokeWidth="1.75" width="17" height="17" style={{ color: "#b8330f" }} />Low stock</h2>
                      <__Link href="/stock" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Stock list</__Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
                      {__list(v.low).map((s, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ flex: "1", minWidth: "0" }}>
                              <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s?.name}</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s?.meta}</span>
                            </span>
                            <span style={{ textAlign: "right" }}>
                              <span style={__sx(`display:block;font-size:var(--text-xs-plus);font-weight:var(--weight-semibold);color:${s?.col ?? ""};font-variant-numeric:tabular-nums`)}>{s?.left} left</span>
                              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>alert at {s?.min}</span>
                            </span>
                            <__Link href="/purchase-orders" style={{ display: "inline-flex", height: "30px", flex: "none", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 10px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>Reorder</__Link>
                          </div>
                        </React.Fragment>))}
                      {v.noLow ? (<>
                        <p style={{ margin: "0", padding: "18px 0 6px", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Everything is above its alert level here.</p>
                      </>) : null}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.visitors?.col ?? ""};order:${v.w?.visitors?.order ?? ""};display:${v.w?.visitors?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="eye" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Store visitors</h2>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />{v.vis?.live} on the store now</span>
                    </div>
                    {v.vis?.show ? (<>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px", marginTop: "14px" }}>
                        <div>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Visitors today</span>
                          <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>1,840</span>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bought</span>
                          <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>2.1%</span>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Top source</span>
                          <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Facebook</span>
                        </div>
                      </div>
                      <p style={{ margin: "12px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Counted by your own storefront tracking. No Google Analytics needed.</p>
                    </>) : null}
                    {v.vis?.hide ? (<>
                      <p style={{ margin: "12px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Visitors belong to the online store. Switch to All branches or Online store to see them.</p>
                    </>) : null}
                  </section>
                  <section style={__sx(`grid-column:${v.w?.carts?.col ?? ""};order:${v.w?.carts?.order ?? ""};display:${v.w?.carts?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="shopping-bag" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Abandoned carts</h2>
                      <__Link href="/abandoned-carts" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Follow up</__Link>
                    </div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px", marginTop: "14px" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>With a phone</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>12</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Left in carts</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>৳38,400</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Recovered this week</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>3</span>
                      </div>
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.top?.col ?? ""};order:${v.w?.top?.order ?? ""};display:${v.w?.top?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="award" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Top products today</h2>
                      <__Link href="/all-products" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Products</__Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
                      {__list(v.top).map((t, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 0", borderTop: "1px solid #f1f5f9", fontSize: "var(--text-xs-plus)" }}>
                            <span style={{ width: "22px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{t?.rank}</span>
                            <span style={{ flex: "1", minWidth: "0", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name}</span>
                            <span style={{ color: "var(--text-muted)" }}>{t?.qty} sold</span>
                            <span style={{ width: "76px", textAlign: "right", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{t?.amt}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.target?.col ?? ""};order:${v.w?.target?.order ?? ""};display:${v.w?.target?.disp ?? ""};flex-direction:column;gap:12px;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="target" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Monthly target</h2>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>September</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{v.target?.mtd}</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>of {v.target?.tgt}</span>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087" }}>{v.target?.pct}</span>
                    </div>
                    <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                      <div style={__sx(`width:${v.target?.barW ?? ""};height:100%;border-radius:var(--radius-full);background:${v.target?.barCol ?? ""}`)} />
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.target?.note}</p>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.quick?.col ?? ""};order:${v.w?.quick?.order ?? ""};display:${v.w?.quick?.disp ?? ""};flex-direction:column;gap:12px;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="zap" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Quick actions</h2>
                    </div>
                    <div className="mo-quick">
                      {__list(v.quick).map((q, $index) => (<React.Fragment key={$index}>
                          <__Link className="dc-h226 mo-quick__tile" href={q?.href ?? "/"} style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", minWidth: "0", padding: "14px", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", background: "#fff", textDecoration: "none", color: "#0f172a" }}>
                            <span style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", background: "#e0f2fe", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <__Icon name={q?.icon} strokeWidth="1.75" width="19" height="19" />
                            </span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{q?.l}</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{q?.s}</span>
                          </__Link>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={__sx(`grid-column:${v.w?.attention?.col ?? ""};order:${v.w?.attention?.order ?? ""};display:${v.w?.attention?.disp ?? ""};flex-direction:column;border-radius:var(--radius-xl);background:#fff;box-shadow:0 3px 10px 0 rgba(48,46,56,.06);padding:18px 20px`)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <h2 style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#334155" }}><__Icon name="bell-ring" strokeWidth="1.75" width="17" height="17" style={{ color: "#003087" }} />Needs attention today</h2>
                      <span style={{ height: "24px", padding: "0 9px", borderRadius: "var(--radius-full)", background: "#fff4e0", color: "#a14f06", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.attCount} to do</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                      {__list(v.attention).map((a, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
                            <span style={__sx(`width:8px;height:8px;border-radius:var(--radius-full);background:${a?.fg ?? ""};flex-shrink:0`)} />
                            <div style={{ flex: "1", minWidth: "0" }}>
                              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{a?.t}</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a?.s}</div>
                            </div>
                            {a?.hasAmt ? (<>
                              <span style={__sx(`font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:${a?.fg ?? ""};font-variant-numeric:tabular-nums`)}>{a?.amt}</span>
                            </>) : null}
                            <__A href={a?.href} style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", display: "inline-flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}>{a?.cta}</__A>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <button className="dc-h227" onClick={v.openPanel} style={__sx(`grid-column:span 1;order:99;display:${v.addDisp ?? ""};flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;border:1.5px dashed #cbd5e1;border-radius:var(--radius-xl);background:transparent;font-family:inherit;cursor:pointer;color:#475569`)}>
                    <__Icon name="plus" strokeWidth="1.75" width="20" height="20" />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Add widget</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.addNote}</span>
                  </button>
                </div>
                <p style={{ margin: "0", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.hiddenNote}</p>
              </main>
            </div>
            {v.panelOpen ? (<>
              <button onClick={v.closePanel} style={{ position: "absolute", inset: "0", zIndex: "150", border: "none", background: "rgba(15,23,42,.28)", cursor: "pointer" }} aria-label="Close customise panel" />
              <aside style={{ position: "absolute", top: "0", right: "0", bottom: "0", zIndex: "160", width: "392px", display: "flex", flexDirection: "column", background: "#fff", borderLeft: "1px solid #e2e8f0", boxShadow: "-18px 0 40px -18px rgba(15,23,42,.35)" }}>
                <div style={{ flex: "none", display: "flex", alignItems: "flex-start", gap: "12px", padding: "20px 20px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ flex: "1" }}>
                    <span style={{ display: "block", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Customise home</span>
                    <span style={{ display: "block", marginTop: "3px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Turn widgets on or off, pick half or full width and set the order.</span>
                  </span>
                  <button className="dc-h228" onClick={v.closePanel} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close">
                    <__Icon name="x" strokeWidth="1.75" width="18" height="18" />
                  </button>
                </div>
                <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "8px 20px" }}>
                  {__list(v.panelRows).map((r, $index) => (<React.Fragment key={$index}>
                      <div style={__sx(`display:flex;flex-direction:column;gap:10px;padding:14px 0;border-bottom:1px solid #f1f5f9;opacity:${r?.op ?? ""}`)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ width: "34px", height: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#003087", display: "grid", placeItems: "center" }}>
                            <__Icon name={r?.icon} strokeWidth="1.75" width="17" height="17" />
                          </span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.name}</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.desc}</span>
                          </span>
                          <button onClick={r?.toggle} style={__sx(`flex:none;display:inline-flex;align-items:center;justify-content:${r?.knob ?? ""};width:40px;height:24px;border:none;border-radius:var(--radius-full);background:${r?.track ?? ""};padding:3px;cursor:pointer`)} aria-label={`Show ${r?.name ?? ""}`} aria-pressed={r?.on}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#fff", boxShadow: "0 1px 2px 0 rgba(15,23,42,.3)" }} />
                          </button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "46px" }}>
                          <span style={{ display: "inline-flex", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "2px", background: "#f8fafc" }}>
                            <button onClick={r?.half} style={__sx(`height:26px;border:none;border-radius:var(--radius-md);background:${r?.halfBg ?? ""};padding:0 10px;font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:${r?.halfCol ?? ""};cursor:pointer`)}>Half</button>
                            <button onClick={r?.full} style={__sx(`height:26px;border:none;border-radius:var(--radius-md);background:${r?.fullBg ?? ""};padding:0 10px;font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:${r?.fullCol ?? ""};cursor:pointer`)}>Full width</button>
                          </span>
                          <span style={{ flex: "1" }} />
                          <button className="dc-h229" onClick={r?.up} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", color: "var(--text-muted)", cursor: "pointer" }} aria-label={`Move ${r?.name ?? ""} up`}>
                            <__Icon name="arrow-up" strokeWidth="1.75" width="15" height="15" />
                          </button>
                          <button className="dc-h230" onClick={r?.down} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", color: "var(--text-muted)", cursor: "pointer" }} aria-label={`Move ${r?.name ?? ""} down`}>
                            <__Icon name="arrow-down" strokeWidth="1.75" width="15" height="15" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>))}
                </div>
                <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ flex: "1", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}><__Icon name="user-check" strokeWidth="1.75" width="14" height="14" />Saved to your staff login. Others keep their own layout.</span>
                  <button className="dc-h231" onClick={v.resetLayout} style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>Reset</button>
                  <button className="dc-h232" onClick={v.closePanel} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#fff", cursor: "pointer" }}>Done</button>
                </div>
              </aside>
            </>) : null}
          </div>
        </div>
      </div>
    );
  }
}
